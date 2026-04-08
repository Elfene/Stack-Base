import { CONTRACT_ADDRESS, CONTRACT_ABI } from './constants';

export function getPlayConfig() {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'play' as const,
  };
}

export function getCheckInConfig() {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'checkIn' as const,
  };
}

export function getSubmitScoreConfig(score: number) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'submitScore' as const,
    args: [BigInt(score)] as const,
  };
}

export function getLeaderboardConfig(limit = 50) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLeaderboard' as const,
    args: [BigInt(limit)] as const,
  };
}

export function getPlayerStatsConfig(address: `0x${string}`) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerStats' as const,
    args: [address] as const,
  };
}
