// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console2} from "forge-std/Test.sol";
import {StreamingTreasury} from "../src/StreamingTreasury.sol";
import {TreasuryFactory} from "../src/TreasuryFactory.sol";

contract StreamingTreasuryTest is Test {
    StreamingTreasury public implementation;
    TreasuryFactory public factory;
    StreamingTreasury public treasury;

    address public owner = makeAddr("owner");
    address public recipient1 = makeAddr("recipient1");
    address public recipient2 = makeAddr("recipient2");
    address public nonOwner = makeAddr("nonOwner");

    uint256 constant INITIAL_BALANCE = 10_000 ether;
    uint256 constant RATE_1 = 1 ether;

    event StreamCreated(uint256 indexed streamId, address recipient, uint256 ratePerSecond);
    event RateChanged(uint256 indexed streamId, uint256 newRate);
    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event StreamStopped(uint256 indexed streamId);
    event Withdrawn(uint256 indexed streamId, address to, uint256 amount);
    event Deposited(uint256 amount);
    event TreasuryWithdrawn(uint256 amount, address to);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function setUp() public {
        vm.deal(owner, 100_000 ether);

        vm.startPrank(owner);
        implementation = new StreamingTreasury();
        factory = new TreasuryFactory(address(implementation));

        address treasuryAddr = factory.createTreasury();
        treasury = StreamingTreasury(payable(treasuryAddr));

        vm.deal(address(treasury), INITIAL_BALANCE);

        vm.stopPrank();
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Deployment & Initialization
    // ──────────────────────────────────────────────────────────────────────────────

    function test_InitializeCorrectly() public {
        assertEq(treasury.owner(), owner);
        assertEq(treasury.nextStreamId(), 0);
    }

    function test_RevertWhen_InitializeTwice() public {
        vm.expectRevert();
        treasury.initialize(owner);
    }

    function test_RevertWhen_NonFactoryCallsInitialize() public {
        StreamingTreasury newTreasury = new StreamingTreasury();
        vm.expectRevert();
        newTreasury.initialize(owner);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Deposit
    // ──────────────────────────────────────────────────────────────────────────────

    function test_DepositIncreasesBalance() public {
        uint256 depositAmount = 500 ether;

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit Deposited(depositAmount);

        (bool success, ) = address(treasury).call{value: depositAmount}(abi.encodeWithSignature("deposit()"));
        assertTrue(success);

        assertEq(address(treasury).balance, INITIAL_BALANCE + depositAmount);
    }

    function test_RevertWhen_DepositZero() public {
        vm.prank(owner);
        vm.expectRevert("Deposit amount must be positive");
        (bool success, ) = address(treasury).call{value: 0}(abi.encodeWithSignature("deposit()"));
        assertTrue(success);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Create Stream
    // ──────────────────────────────────────────────────────────────────────────────

    function test_CreateStream() public {
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit StreamCreated(0, recipient1, RATE_1);

        uint256 streamId = treasury.createStream(recipient1, RATE_1);

        assertEq(streamId, 0);
        assertEq(treasury.nextStreamId(), 1);

        (address rec, uint256 rate, uint256 ts, uint256 acc, bool paused) = treasury.streams(0);
        assertEq(rec, recipient1);
        assertEq(rate, RATE_1);
        assertEq(ts, block.timestamp);
        assertEq(acc, 0);
        assertFalse(paused);
    }

    function test_RevertWhen_CreateStreamZeroRate() public {
        vm.prank(owner);
        vm.expectRevert("Rate must be positive");
        treasury.createStream(recipient1, 0);
    }

    function test_RevertWhen_CreateStreamZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert("Invalid recipient");
        treasury.createStream(address(0), RATE_1);
    }

    function test_RevertWhen_NonOwnerCreatesStream() public {
        vm.prank(nonOwner);
        vm.expectRevert("Caller is not the owner");
        treasury.createStream(recipient1, RATE_1);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Change Rate
    // ──────────────────────────────────────────────────────────────────────────────

    function test_ChangeRate() public {
        uint256 streamId = _createStream(recipient1, RATE_1);

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit RateChanged(streamId, 2 ether);

        treasury.changeRate(streamId, 2 ether);

        (, uint256 newRate, , , ) = treasury.streams(streamId);
        assertEq(newRate, 2 ether);
    }

    function test_RevertWhen_ChangeRateNonExistent() public {
        vm.prank(owner);
        vm.expectRevert("Stream does not exist");
        treasury.changeRate(999, 2 ether);
    }

    function test_RevertWhen_ChangeRateZero() public {
        uint256 streamId = _createStream(recipient1, RATE_1);
        vm.prank(owner);
        vm.expectRevert("Rate must be positive");
        treasury.changeRate(streamId, 0);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Pause / Resume
    // ──────────────────────────────────────────────────────────────────────────────

    function test_PauseAndResume() public {
        uint256 streamId = _createStream(recipient1, RATE_1);

        skip(10);

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit StreamPaused(streamId);
        treasury.pauseStream(streamId);

        (, , , uint256 accruedBefore, ) = treasury.streams(streamId);
        assertEq(accruedBefore, 10 ether);

        skip(20);

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit StreamResumed(streamId);
        treasury.resumeStream(streamId);

        skip(5);

        uint256 withdrawable = treasury.getWithdrawable(streamId);
        assertEq(withdrawable, 15 ether);
    }

    function test_RevertWhen_PauseNonExistent() public {
        vm.prank(owner);
        vm.expectRevert("Stream does not exist");
        treasury.pauseStream(999);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Stop Stream
    // ──────────────────────────────────────────────────────────────────────────────

    function test_StopStream() public {
        uint256 streamId = _createStream(recipient1, RATE_1);

        skip(15);

        vm.prank(owner);
        vm.expectEmit(true, false, false, false);
        emit StreamStopped(streamId);
        treasury.stopStream(streamId);

        (, uint256 rate, , , bool paused) = treasury.streams(streamId);
        assertEq(rate, 0);
        assertTrue(paused);

        uint256 withdrawable = treasury.getWithdrawable(streamId);
        assertEq(withdrawable, 15 ether);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Withdraw (Recipient)
    // ──────────────────────────────────────────────────────────────────────────────

    function test_RecipientCanWithdraw() public {
        uint256 streamId = _createStream(recipient1, RATE_1);

        skip(30);

        uint256 expected = 30 ether;
        uint256 beforeBalance = recipient1.balance;

        vm.prank(recipient1);
        vm.expectEmit(true, true, true, true);
        emit Withdrawn(streamId, recipient1, expected);

        treasury.withdraw(streamId, expected, recipient1);

        assertEq(recipient1.balance, beforeBalance + expected);

        (, , , uint256 accruedAfter, ) = treasury.streams(streamId);
        assertEq(accruedAfter, 0);
    }

    function test_RevertWhen_WithdrawMoreThanAccrued() public {
        uint256 streamId = _createStream(recipient1, RATE_1);
        skip(10);

        vm.prank(recipient1);
        vm.expectRevert("Insufficient accrued");
        treasury.withdraw(streamId, 20 ether, recipient1);
    }

    function test_RevertWhen_NonRecipientWithdraws() public {
        uint256 streamId = _createStream(recipient1, RATE_1);
        skip(10);

        vm.prank(nonOwner);
        vm.expectRevert("Only recipient can withdraw");
        treasury.withdraw(streamId, 5 ether, recipient1);
    }

    function test_RevertWhen_TreasuryUnderfunded() public {
        uint256 streamId = _createStream(recipient1, RATE_1);
        skip(100);

        vm.prank(owner);
        treasury.withdrawTreasury(address(treasury).balance, owner);

        vm.prank(recipient1);
        vm.expectRevert("Treasury insufficient balance");
        treasury.withdraw(streamId, 50 ether, recipient1);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Treasury Withdraw (Owner)
    // ──────────────────────────────────────────────────────────────────────────────

    function test_OwnerCanWithdrawTreasury() public {
        uint256 amount = 2000 ether;
        uint256 before = owner.balance;

        vm.prank(owner);
        vm.expectEmit(true, false, false, true);
        emit TreasuryWithdrawn(amount, owner);

        treasury.withdrawTreasury(amount, owner);

        assertEq(owner.balance, before + amount);
    }

    function test_RevertWhen_OwnerWithdrawsTooMuch() public {
        vm.prank(owner);
        vm.expectRevert("Insufficient balance");
        treasury.withdrawTreasury(INITIAL_BALANCE + 1, owner);
    }

    function test_RevertWhen_NonOwnerWithdrawsTreasury() public {
        vm.prank(nonOwner);
        vm.expectRevert("Caller is not the owner");
        treasury.withdrawTreasury(100 ether, nonOwner);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // View Functions
    // ──────────────────────────────────────────────────────────────────────────────

    function test_GetWithdrawable() public {
        uint256 streamId = _createStream(recipient1, RATE_1);

        skip(7);
        assertEq(treasury.getWithdrawable(streamId), 7 ether);

        vm.prank(owner);
        treasury.pauseStream(streamId);

        skip(10);
        assertEq(treasury.getWithdrawable(streamId), 7 ether);

        vm.prank(owner);
        treasury.resumeStream(streamId);

        skip(3);
        assertEq(treasury.getWithdrawable(streamId), 10 ether);
    }

    // ──────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────────────────

    function _createStream(address recipient, uint256 rate) internal returns (uint256) {
        vm.prank(owner);
        return treasury.createStream(recipient, rate);
    }
}