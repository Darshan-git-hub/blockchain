// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AggregatorV3Interface.sol";
import "./ICoinCred.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract CoinCredd is ICoinCred{ 
    
  //address
  address[] public  allowedTokens;
  
   address[] public  allowedCollateral;
    //events
    event Request(address indexed _requster,address indexed _token,uint256 indexed _tokenAmount,uint256 _tokenProfit,uint256 _requestId);
    event Lend(address indexed _requster,address indexed _token,address indexed  _lender,uint256 _tokenMaount);
    event Liquidate(address indexed _requster,address indexed _token,address indexed  _liquidator,uint256 _tokenMaount);
    event Repay(address indexed _requster,address indexed _token,uint256 _tokenMaount);
     event Cancel(address indexed _requster,address indexed _token,uint256 _collateralAmount);

    //mapping

    mapping(uint256 =>RequestLoan)public requestloan;
    //token to price feed
    mapping(address  => address) public tokens;
    //collateral
     mapping(address  => address) public collateral;

     mapping(address =>bool)public tokenAllowed;
      mapping(address =>bool)public collateralAllowed;

    uint256 numOfRequestLoans;
    //modifier
    //check token allowed
    modifier isTokenAllowed(address _token){
        require(tokenAllowed[_token],"Token not allowed");
        _;

    }

    modifier isCollateralAllowed(address _collateral){
        require(collateralAllowed[_collateral],"collateral not allowed");
        _;

    }
    
    //check collateral price is greater than token

    modifier checkPrice (address _token,uint256 _tokenAmount, address _collateral,uint256 _collateralAmount){
        require((_collateralAmount* getTokenValue(collateral[_collateral])) > (_tokenAmount*getTokenValue(tokens[_token])),"Collateral is less");
        _;
    }

    //

constructor(address[] memory _tokens, address[] memory _priceFeed,address[] memory _collateral, address[] memory _collateralPriceFeed){
    require(_tokens.length >0 ,"tokens can't be empty");
    require(_priceFeed.length >0 ,"tokens can't be empty");
    require(_tokens.length == _priceFeed.length ,"not same length");
     require(_collateral.length >0 ,"tokens can't be empty");
    require(_collateralPriceFeed.length >0 ,"tokens can't be empty");
    require(_collateral.length == _collateralPriceFeed.length ,"not same length");

    for (uint256 i =0; i < _tokens.length; i++){
        tokens[_tokens[i]] = _priceFeed[i];
         tokenAllowed[_tokens[i]] =true;
        

    }
     for (uint256 i =0; i < _collateral.length; i++){
        collateral[_collateral[i]] = _collateralPriceFeed[i];
         collateralAllowed[_collateral[i]] =true;
        

    }


}

function createLoanRequest(address _tokenRequest,uint256 _tokenAmount, uint256 _tokenProfit,uint256 duration,address _collateralAddress)external payable   override  {
    
    uint256 _collateralAmount = msg.value;
    compare(_tokenRequest,_tokenAmount,_collateralAddress,_collateralAmount);
    uint256 requestId = numOfRequestLoans;
    requestloan[requestId] = RequestLoan({   loanRequester:msg.sender,
         lender:address(0),
         tokenRequest:_tokenRequest,
         tokenAmount:_tokenAmount,
          tokenProfit:_tokenProfit,
         loanId:requestId,
          lendOut:false,
         duration: block.timestamp+duration,
         collateralAddr:_collateralAddress,
         collatrealAmount:_collateralAmount});

         payable(address(this)).transfer(_collateralAmount);
         numOfRequestLoans ++;
         emit Request(msg.sender, _tokenRequest, _tokenAmount, _tokenProfit, requestId);
}
    function lendtoken(uint256 _loanId)external override {
        require(_loanId <= numOfRequestLoans,"request does not exists");
        RequestLoan storage rq = requestloan[_loanId];
        require(rq.lendOut !=true,"already lendOut");

        require(IERC20(rq.tokenRequest).transferFrom(msg.sender,rq.loanRequester,rq.tokenAmount),"failed");
        rq.lender = msg.sender;
        rq.lendOut =true;
        emit Lend(rq.loanRequester,rq.tokenRequest, msg.sender, rq.tokenAmount);
        
    } 
    function liquidate(uint256 _loanId)external override {
        require(_loanId <= numOfRequestLoans,"request does not exists");
        RequestLoan storage rq = requestloan[_loanId];
        require(rq.lendOut == true,"can't liquidate");
        require(rq.lender != address(0),"no lender");
        require(rq.duration < block.timestamp,"Active Loan");
        require(IERC20(rq.tokenRequest).transferFrom(msg.sender,rq.loanRequester,(rq.tokenAmount+rq.tokenProfit)),"failed");
        
        payable(msg.sender).transfer(rq.collatrealAmount);

        rq.lendOut = false;
        rq.lender = address(0);

        emit Liquidate(rq.loanRequester,rq.tokenRequest,msg.sender,rq.tokenAmount);




    }
    function RepayLoan(uint256 _loanId)external override {
         require(_loanId <= numOfRequestLoans,"request does not exists");
        RequestLoan storage rq = requestloan[_loanId];
        require(rq.lendOut == true,"not yet lend out");
        require(IERC20(rq.tokenRequest).transferFrom(msg.sender,rq.loanRequester,(rq.tokenAmount+rq.tokenProfit)),"failed");
        payable(msg.sender).transfer(rq.collatrealAmount);
        rq.lendOut ==false;
       // rq.lender = address(0);
        emit Repay(rq.loanRequester, rq.tokenRequest, rq.tokenAmount);

    } 
    function cancelLoanRequest(uint256 _loanId) external override {
         require(_loanId <= numOfRequestLoans,"request does not exists");
          RequestLoan storage rq = requestloan[_loanId];
          require(rq.lender == address(0),"can't cancel");
          require(rq.lendOut ==false ,"Alreay loaned Out");
          require(rq.loanRequester ==msg.sender,"not your loan");
          payable(msg.sender).transfer(rq.collatrealAmount);
          emit Cancel(msg.sender, rq.tokenRequest, rq.collatrealAmount);

          


    }


    //function to getAll loan Requests

    function getAllRequest()external view returns(RequestLoan[] memory loans){
        loans = new RequestLoan[](numOfRequestLoans);

        for (uint256 i=0; i < numOfRequestLoans; i++){
            loans[i] = requestloan[i];
        }
    return loans;
    }

     function getAllUserLoanRequests(address _user)external view returns(RequestLoan[] memory loans){
        uint256 count=0;
        for (uint256 i=0; i < numOfRequestLoans; i++){
            if(requestloan[i].loanRequester == _user){
                count ++;
            }
                   }
           loans = new RequestLoan[](count);  
           uint256 index=0;
           for (uint256 j=0; j < numOfRequestLoans; j++){
            if(requestloan[j].loanRequester == _user){
                 loans[index] = requestloan[j];
                 index ++;
                
            }   
            
     }
     return  loans; 

     }
   function getAllLenderRequest(address _lender)external view returns(RequestLoan[] memory loans){
        uint256 count=0;
        for (uint256 i=0; i < numOfRequestLoans; i++){
            if(requestloan[i].lender == _lender){
                count ++;
            }
                   }
           loans = new RequestLoan[](count);  
           uint256 index=0;
           for (uint256 j=0; j < numOfRequestLoans;j++){
            if(requestloan[j].loanRequester == _lender){
                 loans[index] = requestloan[j];
                 index ++;
                
            }   
           

     }
      return  loans; 
     }
function getAllLoanRequestIssued()external view returns(RequestLoan[] memory loans){
    uint256 count=0;
        for (uint256 i=0; i < numOfRequestLoans; i++){
            if(requestloan[i].lendOut == false){
                count ++;
            }
                   }
           loans = new RequestLoan[](count);  
           uint256 index=0;
           for (uint256 j=0; j < numOfRequestLoans;j++){
            if(requestloan[j].lendOut == false){
                 loans[index] = requestloan[j];
                 index ++;
                
            }   
           

     }
      return  loans; 
}
    function getTokenValue(
       
        address  _feed
    ) public view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            _feed
        );
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return ( uint256(price));
    }
     function compare (address _token,uint256 _tokenAmount, address _collateral,uint256 _collateralAmount)internal view{
        require((_collateralAmount* getTokenValue(collateral[_collateral])) > (_tokenAmount*getTokenValue(tokens[_token])),"Collateral is less");
        
    }
     function getCurrentBlockTimeStamp()external view  override  returns(uint256){
        return block.timestamp;
    }
    receive() external payable { }
    fallback() external payable { }

}




