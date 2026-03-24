// Ink Mainnet (chain ID 57073)
export const LEADERBOARD_ADDRESS =
  '0x5b92d630F4a3CDCBD2944d5AF0f095e9b9E8EC8f' as const;

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
  // ── Check-in ──────────────────────────────────
  {
    name: 'checkIn',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getStreak',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'getMultiplier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'player', type: 'address' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'lastCheckIn',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'CheckedIn',
    type: 'event',
    inputs: [
      { name: 'player', type: 'address', indexed: true },
      { name: 'streak', type: 'uint8',   indexed: false },
    ],
  },
] as const;