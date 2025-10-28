// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct RequestLoan {
    address loanRequester;
    address lender;
    address tokenRequest;
    uint256 tokenAmount;
    uint256 tokenProfit;
    uint256 loanId;
    bool funded;
    uint256 dueDate;
    address collateralAddr;
    uint256 collateralAmount;
    bool isRepaid;
}

interface ICoinCred {
    function createLoanRequest(
        address _tokenRequest,
        uint256 _tokenAmount,
        uint256 _tokenProfit,
        uint256 _duration,
        address _collateralAddress,
        uint256 _collateralAmount
    ) external payable;

    function lendToken(uint256 _loanId) external;
    function repayLoan(uint256 _loanId) external;
    function liquidate(uint256 _loanId) external;
    function cancelLoanRequest(uint256 _loanId) external;

    function getAllRequest() external view returns (RequestLoan[] memory);
    function getAllUserLoanRequests(address _user) external view returns (RequestLoan[] memory);
    function getAllLenderRequest(address _lender) external view returns (RequestLoan[] memory);
    function getAllLoanRequestIssued() external view returns (RequestLoan[] memory);
    function getCurrentBlockTimeStamp() external view returns (uint256);
}