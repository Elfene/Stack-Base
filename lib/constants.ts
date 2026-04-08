export const GAME_CONFIG = {
  INITIAL_BLOCK_SIZE: { x: 3, y: 0.5, z: 3 },
  BLOCK_HEIGHT: 0.5,
  INITIAL_SPEED: 0.85,
  SPEED_INCREMENT: 0.35,
  SPEED_INCREASE_INTERVAL: 10,
  PERFECT_THRESHOLD: 0.08,
  PERFECT_BONUS: 2,
  SWING_AMPLITUDE: 4,
  DROP_DURATION: 0.4,
  CAMERA_LERP_FACTOR: 0.08,
  MAX_SPEED: 3,
} as const;

export const CONTRACT_ADDRESS = '0x1D2a28E9dd71A9252ECdB184EEa20B6876F8e29E' as const;

export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'play',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'checkIn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'canCheckIn',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'score', type: 'uint256' }],
    name: 'submitScore',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'highScores',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'hasNFT',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'gamesPlayed',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'checkInCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'lastCheckIn',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'player', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { name: 'games', type: 'uint256' },
      { name: 'best', type: 'uint256' },
      { name: 'checkIns', type: 'uint256' },
      { name: 'lastCheck', type: 'uint256' },
      { name: 'nft', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'limit', type: 'uint256' }],
    name: 'getLeaderboard',
    outputs: [
      {
        components: [
          { name: 'player', type: 'address' },
          { name: 'score', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'gameNumber', type: 'uint256' },
    ],
    name: 'GameStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'count', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'CheckedIn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'score', type: 'uint256' },
    ],
    name: 'NewHighScore',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'player', type: 'address' },
      { indexed: false, name: 'tokenId', type: 'uint256' },
    ],
    name: 'NFTMinted',
    type: 'event',
  },
] as const;
