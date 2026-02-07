// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {StreamingTreasury} from "../src/StreamingTreasury.sol";
import {TreasuryFactory} from "../src/TreasuryFactory.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        StreamingTreasury implementation = new StreamingTreasury();
        TreasuryFactory factory = new TreasuryFactory(address(implementation));
        vm.stopBroadcast();
    }
}