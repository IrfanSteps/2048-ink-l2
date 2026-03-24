# 2048 Leaderboard — Ink L2 Smart Contract

On-chain leaderboard for the 2048 game, deployed on **Ink Sepolia** (Ink L2 testnet).

## Contract Overview

`Leaderboard.sol` tracks the best score ever achieved by each wallet and exposes a ranked top-10 view.

| Function | Description |
|---|---|
| `submitScore(uint256 score)` | Records a new score; only updates storage if it beats the caller's personal best. |
| `getTopScores()` | Returns the top 10 `(address[], uint256[])` sorted by score descending. |
| `playerCount()` | Total number of unique players on the board. |
| `bestScore(address)` | Public mapping — query anyone's personal best. |

**Event:** `ScoreSubmitted(address indexed player, uint256 score)` — emitted only when a new personal best is set.

---

## Prerequisites

| Tool | Version |
|---|---|
| [Foundry](https://getfoundry.sh/) | latest |
| Node / npm | optional (for front-end integration only) |

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## Setup

```bash
# 1. Clone / open the project
cd 2048

# 2. Install dependencies
forge install

# 3. Copy the env template
cp .env.example .env
# Edit .env and set PRIVATE_KEY (and optionally RPC_URL)
```

---

## Running Tests

```bash
forge test -vv
```

Run with gas reports:

```bash
forge test --gas-report
```

Run only a specific test:

```bash
forge test --match-test test_getTopScores_capsAtTen -vvv
```

---

## Deploying to Ink Sepolia

> **Get test ETH:** Use the [Ink Sepolia faucet](https://inkonchain.com/faucet) before deploying.

```bash
# Load env vars (PowerShell)
$env:PRIVATE_KEY = (Get-Content .env | Select-String "PRIVATE_KEY").ToString().Split("=")[1]

# Deploy + broadcast
forge script script/Deploy.s.sol \
  --rpc-url ink_sepolia \
  --private-key $env:PRIVATE_KEY \
  --broadcast
```

### With Contract Verification

```bash
forge script script/Deploy.s.sol \
  --rpc-url ink_sepolia \
  --private-key $env:PRIVATE_KEY \
  --broadcast \
  --verify \
  --verifier-url https://explorer-sepolia.inkonchain.com/api \
  --verifier etherscan \
  --etherscan-api-key verifyContract
```

The `foundry.toml` pre-configures the `ink_sepolia` network alias so you don't need to type the full RPC URL.

---

## Network Details

| Property | Value |
|---|---|
| Network | Ink Sepolia |
| RPC URL | `https://rpc-gel-sepolia-ingress.inkonchain.com` |
| Block Explorer | `https://explorer-sepolia.inkonchain.com` |
| Chain ID | 763373 |

---

## Project Structure

```
2048/
├── src/
│   └── Leaderboard.sol       # Main contract
├── test/
│   └── Leaderboard.t.sol     # Forge tests (unit + fuzz)
├── script/
│   └── Deploy.s.sol          # Deployment script
├── lib/                      # Forge dependencies (forge-std etc.)
├── foundry.toml              # Foundry configuration
├── .env.example              # Environment variable template
└── README.md
```

---

## License

MIT
