// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {AggregatorV3Interface} from "foundry-chainlink-toolkit/src/interfaces/feeds/AggregatorV3Interface.sol";
import {ICoinCred, RequestLoan} from "./ICoinCred.sol";

/// @title CoinCred – Peer-to-peer lending with ETH/ERC20 collateral
contract CoinCred is ICoinCred, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant BASIS_POINTS = 10_000;
    address public immutable OWNER;

    // Price feeds
    mapping(address => address) public tokenPriceFeeds;
    mapping(address => address) public collateralPriceFeeds;

    // Whitelists
    mapping(address => bool) public isTokenAllowed;
    mapping(address => bool) public isCollateralAllowed;

    // Loans
    mapping(uint256 => RequestLoan) public loans;
    uint256 public loanCount;

    /*================================ EVENTS ================================*/
    event LoanRequested(
        uint256 indexed loanId,
        address indexed borrower,
        address token,
        uint256 amount,
        uint256 profit,
        uint256 duration,
        address collateral,
        uint256 collateralAmt
    );
    event LoanFunded(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId);
    event LoanLiquidated(uint256 indexed loanId, address indexed liquidator);
    event LoanCancelled(uint256 indexed loanId);

    /*=============================== MODIFIERS ===============================*/
    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    modifier tokenAllowed(address token) {
        _tokenAllowed(token);
        _;
    }

    modifier collateralAllowed(address coll) {
        _collateralAllowed(coll);
        _;
    }

    /*============================= CONSTRUCTOR =============================*/
    constructor(
        address[] memory _tokens,
        address[] memory _tokenFeeds,
        address[] memory _collaterals,
        address[] memory _collateralFeeds
    ) {
        require(_tokens.length == _tokenFeeds.length, "tokens/feeds mismatch");
        require(_collaterals.length == _collateralFeeds.length, "collaterals/feeds mismatch");
        OWNER = msg.sender;

        for (uint256 i = 0; i < _tokens.length; ++i) {
            tokenPriceFeeds[_tokens[i]] = _tokenFeeds[i];
            isTokenAllowed[_tokens[i]] = true;
        }
        for (uint256 i = 0; i < _collaterals.length; ++i) {
            collateralPriceFeeds[_collaterals[i]] = _collateralFeeds[i];
            isCollateralAllowed[_collaterals[i]] = true;
        }
    }

    /*========================== EXTERNAL FUNCTIONS ==========================*/
    function createLoanRequest(
        address _tokenRequest,
        uint256 _tokenAmount,
        uint256 _tokenProfit,
        uint256 _duration,
        address _collateralAddress,
        uint256 _collateralAmount
    )
        external
        payable
        override
        tokenAllowed(_tokenRequest)
        collateralAllowed(_collateralAddress)
        nonReentrant
    {
        require(_tokenAmount > 0, "amount > 0");
        require(_tokenProfit <= BASIS_POINTS, "profit too high");
        require(_duration > 0, "duration > 0");

        uint256 collAmt = _collateralAddress == address(0) ? msg.value : _collateralAmount;
        require(collAmt > 0, "collateral > 0");

        // Collateral sufficiency (18-decimal prices)
        uint256 tokenPrice = getPrice18(tokenPriceFeeds[_tokenRequest]);
        uint256 collPrice = getPrice18(collateralPriceFeeds[_collateralAddress]);
        require(collAmt * collPrice > _tokenAmount * tokenPrice, "insufficient collateral");

        // Transfer collateral
        if (_collateralAddress == address(0)) {
            require(msg.value == collAmt, "ETH mismatch");
        } else {
            IERC20(_collateralAddress).safeTransferFrom(msg.sender, address(this), collAmt);
        }

        // Store loan
        uint256 loanId = loanCount++;
        uint256 dueDate = block.timestamp + _duration;

        RequestLoan storage loan = loans[loanId];
        loan.loanRequester = msg.sender;
        loan.lender = address(0);
        loan.tokenRequest = _tokenRequest;
        loan.tokenAmount = _tokenAmount;
        loan.tokenProfit = _tokenProfit;
        loan.loanId = loanId;
        loan.funded = false;
        loan.dueDate = dueDate;
        loan.collateralAddr = _collateralAddress;
        loan.collateralAmount = collAmt;
        loan.isRepaid = false;

        emit LoanRequested(
            loanId,
            msg.sender,
            _tokenRequest,
            _tokenAmount,
            _tokenProfit,
            _duration,
            _collateralAddress,
            collAmt
        );
    }

    function lendToken(uint256 _loanId) external override nonReentrant {
        RequestLoan storage loan = loans[_loanId];
        require(loan.loanId == _loanId, "invalid loan");
        require(!loan.funded, "already funded");
        require(block.timestamp <= loan.dueDate, "loan expired"); // Prevent funding expired loans

        loan.lender = msg.sender;
        loan.funded = true;

        IERC20(loan.tokenRequest).safeTransferFrom(msg.sender, loan.loanRequester, loan.tokenAmount);
        emit LoanFunded(_loanId, msg.sender);
    }

    function repayLoan(uint256 _loanId) external override nonReentrant {
        RequestLoan storage loan = loans[_loanId];
        require(loan.loanId == _loanId, "invalid loan");
        require(loan.funded, "not funded");
        require(!loan.isRepaid, "already repaid");
        require(msg.sender == loan.loanRequester, "not borrower");
        require(block.timestamp <= loan.dueDate, "overdue");

        uint256 interest = (loan.tokenAmount * loan.tokenProfit) / BASIS_POINTS;
        uint256 totalRepay = loan.tokenAmount + interest;
        IERC20(loan.tokenRequest).safeTransferFrom(msg.sender, loan.lender, totalRepay);
        _returnCollateral(loan);
        loan.isRepaid = true;

        emit LoanRepaid(_loanId);
    }

    function liquidate(uint256 _loanId) external override nonReentrant {
        RequestLoan storage loan = loans[_loanId];
        require(loan.loanId == _loanId, "invalid loan");
        require(loan.funded, "not funded");
        require(!loan.isRepaid, "already repaid");
        require(block.timestamp > loan.dueDate, "not overdue");

        uint256 interest = (loan.tokenAmount * loan.tokenProfit) / BASIS_POINTS;
        uint256 totalDebt = loan.tokenAmount + interest;
        IERC20(loan.tokenRequest).safeTransferFrom(msg.sender, loan.lender, totalDebt);
        _returnCollateralTo(loan, msg.sender);

        loan.funded = false;
        loan.lender = address(0);
        emit LoanLiquidated(_loanId, msg.sender);
    }

    function cancelLoanRequest(uint256 _loanId) external override nonReentrant {
        RequestLoan storage loan = loans[_loanId];
        require(loan.loanId == _loanId, "invalid loan");
        require(!loan.funded, "already funded");
        require(msg.sender == loan.loanRequester, "not borrower");

        _returnCollateral(loan);
        delete loans[_loanId];
        emit LoanCancelled(_loanId);
    }

    /*============================ VIEW FUNCTIONS ============================*/
    function getAllRequest() external view override returns (RequestLoan[] memory) {
        return _getAllLoans();
    }

    function getAllUserLoanRequests(address _user)
        external
        view
        override
        returns (RequestLoan[] memory)
    {
        return _filterLoansByBorrower(_user);
    }

    function getAllLenderRequest(address _lender)
        external
        view
        override
        returns (RequestLoan[] memory)
    {
        return _filterLoansByLender(_lender);
    }

    function getAllLoanRequestIssued()
        external
        view
        override
        returns (RequestLoan[] memory)
    {
        return _filterUnfundedLoans();
    }

    function getCurrentBlockTimeStamp() external view override returns (uint256) {
        return block.timestamp;
    }

    /*=========================== INTERNAL HELPERS ===========================*/
    function _returnCollateral(RequestLoan storage loan) internal {
        _returnCollateralTo(loan, loan.loanRequester);
    }

    function _returnCollateralTo(RequestLoan storage loan, address to) internal {
        if (loan.collateralAddr == address(0)) {
            payable(to).transfer(loan.collateralAmount);
        } else {
            IERC20(loan.collateralAddr).safeTransfer(to, loan.collateralAmount);
        }
    }

    /// @dev Returns price with 18 decimals (Chainlink feeds usually 8 decimals).
    function getPrice18(address feed) internal view returns (uint256) {
    (, int256 price, , ,) = AggregatorV3Interface(feed).latestRoundData();
    require(price > 0, "invalid price");

    // casting to 'uint256' is safe because Chainlink prices are positive int256 (8 decimals)
    // forge-lint: disable-next-line(unsafe-typecast)
    return uint256(price) * 1e10; // 8 → 18 decimals
}


    function _getAllLoans() internal view returns (RequestLoan[] memory) {
        RequestLoan[] memory all = new RequestLoan[](loanCount);
        for (uint256 i = 0; i < loanCount; ++i) all[i] = loans[i];
        return all;
    }

    function _filterLoansByBorrower(address user) internal view returns (RequestLoan[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < loanCount; ++i)
            if (loans[i].loanRequester == user) ++count;

        RequestLoan[] memory filtered = new RequestLoan[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < loanCount; ++i)
            if (loans[i].loanRequester == user) filtered[idx++] = loans[i];
        return filtered;
    }

    function _filterLoansByLender(address lender) internal view returns (RequestLoan[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < loanCount; ++i)
            if (loans[i].lender == lender) ++count;

        RequestLoan[] memory filtered = new RequestLoan[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < loanCount; ++i)
            if (loans[i].lender == lender) filtered[idx++] = loans[i];
        return filtered;
    }

    function _filterUnfundedLoans() internal view returns (RequestLoan[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < loanCount; ++i)
            if (!loans[i].funded) ++count;

        RequestLoan[] memory filtered = new RequestLoan[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < loanCount; ++i)
            if (!loans[i].funded) filtered[idx++] = loans[i];
        return filtered;
    }

    /*============================= MODIFIER LOGIC ===========================*/
    function _onlyOwner() private view {
        require(msg.sender == OWNER, "not owner");
    }

    function _tokenAllowed(address token) private view {
        require(isTokenAllowed[token], "token not allowed");
    }

    function _collateralAllowed(address coll) private view {
        require(isCollateralAllowed[coll], "collateral not allowed");
    }

    /*================================ ADMIN ===============================*/
    function addToken(address token, address feed) external onlyOwner {
        tokenPriceFeeds[token] = feed;
        isTokenAllowed[token] = true;
    }

    function addCollateral(address coll, address feed) external onlyOwner {
        collateralPriceFeeds[coll] = feed;
        isCollateralAllowed[coll] = true;
    }

    /*============================ FALLBACKS ===============================*/
    receive() external payable {}
    fallback() external payable {}
}