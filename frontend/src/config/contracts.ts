// Ink Mainnet (chain ID 57073)
export const LEADERBOARD_ADDRESS =
  '0xE08F733CbEA9321189893Fa1DbEebD63F784d57a' as const;

export const LEADERBOARD_CHAIN_ID = 57073;

export const LEADERBOARD_ABI = [
  {
    name: 'submitScore',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'score', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getTopScores',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'players', type: 'address[]' },
      { name: 'scores',  type: 'uint256[]' },
    ],
  },
  {
    name: 'bestScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'playerCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'ScoreSubmitted',
    type: 'event',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'score',  type: 'uint256', indexed: false },
    ],
  },
] as const;