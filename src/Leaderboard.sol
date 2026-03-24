// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Leaderboard
/// @notice Stores best scores and daily check-in streaks for the 2048 game on Ink L2.
contract Leaderboard {
    // ─────────────────────────────────────────────
    //  State
    // ─────────────────────────────────────────────

    /// @notice Best score recorded for each address.
    mapping(address => uint256) public bestScore;

    /// @dev Array of all addresses that have ever submitted a score.
    address[] private _players;

    /// @dev Quick lookup to avoid duplicate entries in _players.
    mapping(address => bool) private _hasPlayed;

    // ── Check-in ──────────────────────────────────

    /// @notice Timestamp of the last check-in for each address.
    mapping(address => uint256) public lastCheckIn;

    /// @notice Current streak (1-7) for each address.
    mapping(address => uint8) public streak;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    /// @notice Emitted whenever a player sets a new personal best.
    event ScoreSubmitted(address indexed player, uint256 score);

    /// @notice Emitted on every successful check-in.
    event CheckedIn(address indexed player, uint8 streak);

    // ─────────────────────────────────────────────
    //  External functions
    // ─────────────────────────────────────────────

    /// @notice Submit a score. Only updates storage when the new score beats the player's current best.
    /// @param score The score achieved in this game session.
    function submitScore(uint256 score) external {
        require(score > 0, "Leaderboard: score must be > 0");

        if (!_hasPlayed[msg.sender]) {
            _hasPlayed[msg.sender] = true;
            _players.push(msg.sender);
        }

        if (score > bestScore[msg.sender]) {
            bestScore[msg.sender] = score;
            emit ScoreSubmitted(msg.sender, score);
        }
    }

    /// @notice Daily check-in. Can be called once per 24 h window.
    ///         - Within 24-48 h of last check-in  → streak increments (max 7)
    ///         - More than 48 h since last check-in → streak resets to 1
    ///         - Within the same 24 h window       → reverts
    function checkIn() external {
        uint256 last = lastCheckIn[msg.sender];
        uint256 elapsed = block.timestamp - last;

        // First-ever check-in (last == 0) is always allowed.
        if (last != 0) {
            require(elapsed >= 1 days, "Leaderboard: already checked in today");
        }

        uint8 currentStreak = streak[msg.sender];

        if (last == 0 || elapsed > 2 days) {
            // First check-in ever, or missed a day → reset to 1.
            currentStreak = 1;
        } else {
            // Within the valid 24-48 h window → extend streak, cap at 7.
            currentStreak = currentStreak >= 7 ? 7 : currentStreak + 1;
        }

        streak[msg.sender]       = currentStreak;
        lastCheckIn[msg.sender]  = block.timestamp;

        emit CheckedIn(msg.sender, currentStreak);
    }

    // ─────────────────────────────────────────────
    //  View functions
    // ─────────────────────────────────────────────

    /// @notice Returns the current streak (1-7) for a player.
    function getStreak(address player) external view returns (uint8) {
        return streak[player] == 0 ? 0 : streak[player];
    }

    /// @notice Returns the multiplier string ("x1.1" … "x1.7") for a player.
    ///         Returns "x1.0" if the player has never checked in.
    function getMultiplier(address player) external view returns (string memory) {
        uint8 s = streak[player];
        if (s == 0) return "x1.0";
        if (s == 1) return "x1.1";
        if (s == 2) return "x1.2";
        if (s == 3) return "x1.3";
        if (s == 4) return "x1.4";
        if (s == 5) return "x1.5";
        if (s == 6) return "x1.6";
        return "x1.7";
    }

    /// @notice Returns the top 10 players sorted by best score (descending).
    /// @return players  Array of player addresses (up to 10).
    /// @return scores   Corresponding best scores.
    function getTopScores()
        external
        view
        returns (address[] memory players, uint256[] memory scores)
    {
        uint256 total = _players.length;
        uint256 size = total < 10 ? total : 10;

        // Copy all player data into memory for sorting.
        address[] memory allPlayers = new address[](total);
        uint256[] memory allScores = new uint256[](total);

        for (uint256 i = 0; i < total; i++) {
            allPlayers[i] = _players[i];
            allScores[i] = bestScore[_players[i]];
        }

        // Simple selection sort (acceptable for ≤ a few thousand players on-chain).
        for (uint256 i = 0; i < size; i++) {
            uint256 maxIdx = i;
            for (uint256 j = i + 1; j < total; j++) {
                if (allScores[j] > allScores[maxIdx]) {
                    maxIdx = j;
                }
            }
            if (maxIdx != i) {
                (allScores[i], allScores[maxIdx]) = (allScores[maxIdx], allScores[i]);
                (allPlayers[i], allPlayers[maxIdx]) = (allPlayers[maxIdx], allPlayers[i]);
            }
        }

        players = new address[](size);
        scores = new uint256[](size);
        for (uint256 i = 0; i < size; i++) {
            players[i] = allPlayers[i];
            scores[i] = allScores[i];
        }
    }

    /// @notice Returns the total number of unique players who have ever submitted a score.
    function playerCount() external view returns (uint256) {
        return _players.length;
    }
}
