// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Leaderboard} from "../src/Leaderboard.sol";

contract LeaderboardTest is Test {
    Leaderboard public lb;

    address constant ALICE = address(0xA11CE);
    address constant BOB   = address(0xB0B);
    address constant CAROL = address(0xCA801);

    function setUp() public {
        lb = new Leaderboard();
    }

    // ─────────────────────────────────────────────
    //  submitScore
    // ─────────────────────────────────────────────

    function test_submitScore_storesBestScore() public {
        vm.prank(ALICE);
        lb.submitScore(1000);
        assertEq(lb.bestScore(ALICE), 1000);
    }

    function test_submitScore_updatesOnHigherScore() public {
        vm.startPrank(ALICE);
        lb.submitScore(500);
        lb.submitScore(1500);
        vm.stopPrank();
        assertEq(lb.bestScore(ALICE), 1500);
    }

    function test_submitScore_doesNotUpdateOnLowerScore() public {
        vm.startPrank(ALICE);
        lb.submitScore(2000);
        lb.submitScore(100);
        vm.stopPrank();
        assertEq(lb.bestScore(ALICE), 2000);
    }

    function test_submitScore_revertsOnZero() public {
        vm.prank(ALICE);
        vm.expectRevert("Leaderboard: score must be > 0");
        lb.submitScore(0);
    }

    function test_submitScore_emitsEvent() public {
        vm.prank(ALICE);
        vm.expectEmit(true, false, false, true);
        emit Leaderboard.ScoreSubmitted(ALICE, 999);
        lb.submitScore(999);
    }

    function test_submitScore_doesNotEmitOnNonPersonalBest() public {
        vm.startPrank(ALICE);
        lb.submitScore(1000);
        // No event expected for lower score — record the log count before.
        uint256 logsBefore = vm.getRecordedLogs().length;
        vm.recordLogs();
        lb.submitScore(500);
        vm.stopPrank();
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 0, "Should not emit for non-personal-best");
        // Suppress unused variable warning
        logsBefore;
    }

    // ─────────────────────────────────────────────
    //  playerCount
    // ─────────────────────────────────────────────

    function test_playerCount_incrementsOnNewPlayer() public {
        assertEq(lb.playerCount(), 0);
        vm.prank(ALICE);
        lb.submitScore(100);
        assertEq(lb.playerCount(), 1);
        vm.prank(BOB);
        lb.submitScore(200);
        assertEq(lb.playerCount(), 2);
    }

    function test_playerCount_doesNotIncrementForSamePlayer() public {
        vm.startPrank(ALICE);
        lb.submitScore(100);
        lb.submitScore(300);
        vm.stopPrank();
        assertEq(lb.playerCount(), 1);
    }

    // ─────────────────────────────────────────────
    //  getTopScores
    // ─────────────────────────────────────────────

    function test_getTopScores_emptyLeaderboard() public view {
        (address[] memory players, uint256[] memory scores) = lb.getTopScores();
        assertEq(players.length, 0);
        assertEq(scores.length, 0);
    }

    function test_getTopScores_singlePlayer() public {
        vm.prank(ALICE);
        lb.submitScore(42);
        (address[] memory players, uint256[] memory scores) = lb.getTopScores();
        assertEq(players.length, 1);
        assertEq(players[0], ALICE);
        assertEq(scores[0], 42);
    }

    function test_getTopScores_sortedDescending() public {
        vm.prank(ALICE);
        lb.submitScore(100);
        vm.prank(BOB);
        lb.submitScore(300);
        vm.prank(CAROL);
        lb.submitScore(200);

        (address[] memory players, uint256[] memory scores) = lb.getTopScores();

        assertEq(scores[0], 300);
        assertEq(players[0], BOB);
        assertEq(scores[1], 200);
        assertEq(players[1], CAROL);
        assertEq(scores[2], 100);
        assertEq(players[2], ALICE);
    }

    function test_getTopScores_capsAtTen() public {
        // Add 12 unique players.
        for (uint160 i = 1; i <= 12; i++) {
            address player = address(i);
            vm.prank(player);
            lb.submitScore(i * 100);
        }

        (address[] memory players, uint256[] memory scores) = lb.getTopScores();
        assertEq(players.length, 10);
        assertEq(scores.length, 10);

        // Top score should be player 12 (score = 1200).
        assertEq(scores[0], 1200);
        // All scores must be descending.
        for (uint256 i = 1; i < 10; i++) {
            assertGe(scores[i - 1], scores[i]);
        }
    }

    // ─────────────────────────────────────────────
    //  Fuzz
    // ─────────────────────────────────────────────

    function testFuzz_submitScore_alwaysKeepsPersonalBest(uint256 a, uint256 b) public {
        vm.assume(a > 0 && b > 0);
        vm.startPrank(ALICE);
        lb.submitScore(a);
        lb.submitScore(b);
        vm.stopPrank();
        uint256 expected = a > b ? a : b;
        assertEq(lb.bestScore(ALICE), expected);
    }
}
