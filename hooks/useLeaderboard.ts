'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/constants';

export interface LeaderboardEntry {
  player: string;
  score: number;
  timestamp: number;
}

export function useLeaderboard(limit = 50) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getLeaderboard',
    args: [BigInt(limit)],
    query: {
      refetchInterval: 30000,
    },
  });

  const entries: LeaderboardEntry[] = data
    ? (data as Array<{ player: string; score: bigint; timestamp: bigint }>).map((entry) => ({
        player: entry.player,
        score: Number(entry.score),
        timestamp: Number(entry.timestamp),
      }))
    : [];

  return { entries, isLoading, refetch };
}
