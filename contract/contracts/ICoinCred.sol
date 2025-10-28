// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


interface ICoinCred {

    struct RequestLoan{
        address loanRequester;
        address  lender;
        address  tokenRequest;
        uint256  tokenAmount;
        uint256   tokenProfit;
        uint256  loanId;
        bool    lendOut;
        uint256 duration;
        address collateralAddr;
        uint256 collatrealAmount;
    }
    

    function createLoanRequest(address _tokenRequest,uint256 _tokenAmount, uint256 _tokenProfit,uint256 duration,address _collateralAddress)external payable  ;
    function lendtoken(uint256 _loanId)external ;
    function liquidate(uint256 _loanId)external ;
    function RepayLoan(uint256 _loanId)external ;
    function cancelLoanRequest(uint256 _loanId) external ;
    function getAllRequest()external view returns(RequestLoan[] memory loans);
    function getAllUserLoanRequests(address _user)external view returns(RequestLoan[] memory loans);
    function getAllLenderRequest(address _lender)external view returns(RequestLoan[] memory loans);
    function getAllLoanRequestIssued()external view returns(RequestLoan[] memory loans);
     function getCurrentBlockTimeStamp()external  view returns(uint256);


    
}