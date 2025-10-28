// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PriceFeedToken {
    address public owner;
    int256 public amount;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    function _onlyOwner() internal view {
        require(msg.sender == owner, "only owner");
    }

    function setPrice(int256 _amount) public onlyOwner {
        amount = _amount;
    }

    function latestRoundData()
        public
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (0, amount, block.timestamp, block.timestamp, 0);
    }
}