// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";  // ← ADD THIS LINE
import {Counter} from "../src/Counter.sol";

contract CounterScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(pk);
        Counter counter = new Counter();
        vm.stopBroadcast();
        console.log("Counter deployed at:", address(counter));  // Alternative (cleaner)
        // OR keep original:
        // emit log_named_address("Counter deployed at", address(counter));
    }
}