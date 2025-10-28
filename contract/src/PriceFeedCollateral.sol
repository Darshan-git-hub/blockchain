// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "foundry-chainlink-toolkit/src/interfaces/feeds/AggregatorV3Interface.sol";

/// @title PriceFeedCollateral – Mock Chainlink feed for collateral (e.g., ETH)
contract PriceFeedCollateral is AggregatorV3Interface {
    int256 public price;

    constructor(int256 _initialPrice) {
        price = _initialPrice;
    }

    function setPrice(int256 _price) external {
        price = _price;
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (0, price, block.timestamp, block.timestamp, 0);
    }

    function decimals() external pure override returns (uint8) { return 8; }
    function description() external pure override returns (string memory) { return "Mock ETH/USD"; }
    function version() external pure override returns (uint256) { return 1; }
    function getRoundData(uint80) external pure override returns (uint80, int256, uint256, uint256, uint80) {
        revert("not implemented");
    }
}