// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Leaderboard
/// @notice Stores best scores per address and returns the top 10 players for the 2048 game on Ink L2.
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

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    /// @notice Emitted whenever a player sets a new personal best.
    event ScoreSubmitted(address indexed player, uint256 score);

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

    // ─────────────────────────────────────────────
    //  View functions
    // ─────────────────────────────────────────────

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
                // Swap scores.
                (allScores[i], allScores[maxIdx]) = (allScores[maxIdx], allScores[i]);
                // Swap addresses.
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
