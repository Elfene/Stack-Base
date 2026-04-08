'use client';

import { useAccount, useWriteContract, useReadContract, useConnect } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/constants';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();

  const { data: playerStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: canCheckInData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'canCheckIn',
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 60000 },
  });

  const login = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  const logout = () => {};

  async function callContract(functionName: 'play' | 'checkIn' | 'submitScore', args?: readonly unknown[]) {
    if (!isConnected) {
      login();
      return false;
    }
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName,
        args: args as never,
      });
      return true;
    } catch (err) {
      console.error(`[BlockStack] ${functionName} failed:`, err);
      return false;
    }
  }

  const play = () => callContract('play');
  const checkIn = () => callContract('checkIn');
  const submitScore = (score: number) => callContract('submitScore', [BigInt(score)]);

  const stats = playerStats
    ? {
        gamesPlayed: Number((playerStats as [bigint, bigint, bigint, bigint, boolean])[0]),
        highScore: Number((playerStats as [bigint, bigint, bigint, bigint, boolean])[1]),
        checkIns: Number((playerStats as [bigint, bigint, bigint, bigint, boolean])[2]),
        lastCheckIn: Number((playerStats as [bigint, bigint, bigint, bigint, boolean])[3]),
        hasNFT: (playerStats as [bigint, bigint, bigint, bigint, boolean])[4],
      }
    : null;

  const canCheckIn = canCheckInData as boolean | undefined;

  return {
    login,
    logout,
    authenticated: isConnected,
    ready: true,
    address,
    isConnected,
    highScore: stats?.highScore ?? 0,
    stats,
    canCheckIn: canCheckIn ?? true,
    play,
    checkIn,
    submitScore,
  };
}
