// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";  // ← Import console
import {WUSDC} from "../src/WUSDC.sol";
import {PriceFeed} from "../src/PriceFeed.sol";
import {PriceFeedCollateral} from "../src/PriceFeedCollateral.sol";
import {CoinCred} from "../src/CoinCred.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPk);

        WUSDC wusdc = new WUSDC();
        PriceFeed usdcFeed = new PriceFeed(100_000_000);        // $1.00
        PriceFeedCollateral ethFeed = new PriceFeedCollateral(2_000_000_000); // $2000

        address[] memory tokens = new address[](1);
        address[] memory tokenFeeds = new address[](1);
        address[] memory collaterals = new address[](2);
        address[] memory collFeeds = new address[](2);

        tokens[0] = address(wusdc);
        tokenFeeds[0] = address(usdcFeed);

        collaterals[0] = address(0); // ETH
        collaterals[1] = address(wusdc);
        collFeeds[0] = address(ethFeed);
        collFeeds[1] = address(usdcFeed);

        CoinCred lending = new CoinCred(tokens, tokenFeeds, collaterals, collFeeds);

        vm.stopBroadcast();

        // CORRECT: Use console.log
        console.log("=== DEPLOYED ADDRESSES ===");
        console.log("WUSDC          :", address(wusdc));
        console.log("USDC Feed      :", address(usdcFeed));
        console.log("ETH Feed       :", address(ethFeed));
        console.log("CoinCred       :", address(lending));
        console.log("=============================");
    }
}