// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

interface IStreamingTreasury {
    function initialize(address _owner) external;
}

contract TreasuryFactory {
    address public immutable implementation;
    mapping(address => address) public treasuryMapping;

    event TreasuryCreated(address indexed owner, address treasury);

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function createTreasury() external returns (address treasury) {
        require(treasuryMapping[msg.sender] == address(0), "treasury already exists");
        treasury = Clones.clone(implementation);
        IStreamingTreasury(treasury).initialize(msg.sender);
        treasuryMapping[msg.sender] = address(treasury);
        emit TreasuryCreated(msg.sender, treasury);
    }

    function predictTreasuryAddress(bytes32 salt) external view returns (address) {
        return Clones.predictDeterministicAddress(implementation, salt, address(this));
    }
}