// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Leaderboard} from "../src/Leaderboard.sol";

/// @notice Deploys Leaderboard.sol to the configured network.
///
/// Usage:
///   forge script script/Deploy.s.sol \
///     --rpc-url $RPC_URL \
///     --private-key $PRIVATE_KEY \
///     --broadcast \
///     --verify \
///     --verifier-url https://explorer-sepolia.inkonchain.com/api \
///     --verifier etherscan \
///     --etherscan-api-key verifyContract
contract Deploy is Script {
    function run() external returns (Leaderboard leaderboard) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        leaderboard = new Leaderboard();
        vm.stopBroadcast();

        console.log("Leaderboard deployed at:", address(leaderboard));
    }
}
