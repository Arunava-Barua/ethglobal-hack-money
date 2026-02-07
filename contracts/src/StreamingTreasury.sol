// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract StreamingTreasury is Initializable {
    // ──────────────────────────────────────────────────────────────────────────────
    // Custom ownership
    // ──────────────────────────────────────────────────────────────────────────────
    address public owner;
    address public pendingOwner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    // ──────────────────────────────────────────────────────────────────────────────
    // Storage
    // ──────────────────────────────────────────────────────────────────────────────

    struct Stream {
        address recipient;
        uint256 ratePerSecond;
        uint256 lastTimestamp;
        uint256 accrued;
        bool paused;
    }

    mapping(uint256 => Stream) public streams;
    uint256 public nextStreamId = 0;

    event StreamCreated(uint256 indexed streamId, address recipient, uint256 ratePerSecond);
    event RateChanged(uint256 indexed streamId, uint256 newRate);
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event StreamStopped(uint256 indexed streamId);
    event Withdrawn(uint256 indexed streamId, address to, uint256 amount);
    event Deposited(uint256 amount);
    event TreasuryWithdrawn(uint256 amount, address to);

    // ──────────────────────────────────────────────────────────────────────────────
    // Initialization
    // ──────────────────────────────────────────────────────────────────────────────

    /// @dev Constructor disables initialization on implementation
    constructor() {
        _disableInitializers();
    }

    /// @notice Initialize the proxy with owner
    function initialize(address _owner) external initializer {
        require(_owner != address(0), "Invalid owner address");
        owner = _owner;
        emit OwnershipTransferred(address(0), _owner);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Ownership management (two-step transfer - safer)
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice Starts the transfer of ownership to a new address (two-step process)
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        require(newOwner != owner, "New owner must be different");

        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Accepts ownership (must be called by the pending owner)
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Caller is not the pending owner");
        address oldOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(oldOwner, owner);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Core functions
    // ──────────────────────────────────────────────────────────────────────────────

    /// @notice sender deposits native token (send with msg.value)
    function deposit() external payable {
        require(msg.value > 0, "Deposit amount must be positive");
        emit Deposited(msg.value);
    }

    /// @notice Owner creates a new stream
    function createStream(address recipient, uint256 ratePerSecond) external onlyOwner returns (uint256 streamId) {
        require(recipient != address(0), "Invalid recipient");
        require(ratePerSecond > 0, "Rate must be positive");

        streamId = nextStreamId++;
        streams[streamId] = Stream({
            recipient: recipient,
            ratePerSecond: ratePerSecond,
            lastTimestamp: block.timestamp,
            accrued: 0,
            paused: false
        });

        emit StreamCreated(streamId, recipient, ratePerSecond);
    }

    /// @notice Owner changes the rate of an existing stream
    function changeRate(uint256 streamId, uint256 newRate) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.recipient != address(0), "Stream does not exist");
        require(newRate > 0, "Rate must be positive");

        _updateAccrued(streamId);
        stream.ratePerSecond = newRate;
        emit RateChanged(streamId, newRate);
    }

    /// @notice Owner pauses a stream (stops accrual)
    function pauseStream(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.recipient != address(0), "Stream does not exist");
        require(!stream.paused, "Already paused");

        _updateAccrued(streamId);
        stream.paused = true;
        emit StreamPaused(streamId);
    }

    /// @notice Owner resumes a paused stream
    function resumeStream(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.recipient != address(0), "Stream does not exist");
        require(stream.paused, "Not paused");

        stream.lastTimestamp = block.timestamp;
        stream.paused = false;
        emit StreamResumed(streamId);
    }

    /// @notice Owner stops a stream (rate → 0)
    function stopStream(uint256 streamId) external onlyOwner {
        Stream storage stream = streams[streamId];
        require(stream.recipient != address(0), "Stream does not exist");

        _updateAccrued(streamId);
        stream.ratePerSecond = 0;
        stream.paused = true;
        emit StreamStopped(streamId);
    }

    /// @notice Recipient withdraws accrued amount
    function withdraw(uint256 streamId, uint256 amount, address to) external {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.recipient, "Only recipient can withdraw");

        _updateAccrued(streamId);
        require(stream.accrued >= amount, "Insufficient accrued");
        require(address(this).balance >= amount, "Treasury insufficient balance");

        stream.accrued -= amount;
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdrawn(streamId, to, amount);
    }

    /// @notice View function: how much is currently withdrawable
    function getWithdrawable(uint256 streamId) external view returns (uint256) {
        Stream memory stream = streams[streamId];
        if (stream.recipient == address(0)) return 0;
        if (stream.paused || stream.ratePerSecond == 0) return stream.accrued;

        uint256 delta = block.timestamp - stream.lastTimestamp;
        uint256 newAccrued = delta * stream.ratePerSecond;
        return stream.accrued + newAccrued;
    }

    /// @notice Owner withdraws funds from treasury
    function withdrawTreasury(uint256 amount, address to) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        emit TreasuryWithdrawn(amount, to);
    }

    /// @dev Internal: accrue time-based amount
    function _updateAccrued(uint256 streamId) internal {
        Stream storage stream = streams[streamId];
        if (stream.paused || stream.ratePerSecond == 0) return;

        uint256 delta = block.timestamp - stream.lastTimestamp;
        uint256 newAccrued = delta * stream.ratePerSecond;
        stream.accrued += newAccrued;
        stream.lastTimestamp = block.timestamp;
    }
}