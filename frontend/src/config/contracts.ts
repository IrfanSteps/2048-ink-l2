export const LEADERBOARD_ADDRESS =
  '0x6664b645777bA229822c86135D853cf26702AEfB' as const;

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