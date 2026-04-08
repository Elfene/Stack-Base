'use client';

import { useAccount, useWriteContract, useReadContract, useConnect, useSendCalls } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/constants';

const PAYMASTER_URL = 'https://api.developer.coinbase.com/rpc/v1/base/XOi2SgdW8UZcMU0jaebjRogFsjqal7Sc';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { sendCallsAsync } = useSendCalls();

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
    if (connector) connect({ connector });
  };

  async function callContract(functionName: 'play' | 'checkIn' | 'submitScore', args?: readonly unknown[]) {
    if (!isConnected) {
      login();
      return false;
    }

    // Try sponsored via paymaster first
    try {
      await sendCallsAsync({
        calls: [{
          to: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName,
          args: args as never,
        }],
        capabilities: {
          paymasterService: {
            url: PAYMASTER_URL,
          },
        },
      });
      return true;
    } catch (err) {
      console.log(`[BlockStack] Paymaster failed for ${functionName}, falling back:`, err);
    }

    // Fallback to regular transaction
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

  return {
    login,
    logout: () => {},
    authenticated: isConnected,
    ready: true,
    address,
    isConnected,
    highScore: stats?.highScore ?? 0,
    stats,
    canCheckIn: (canCheckInData as boolean | undefined) ?? true,
    play,
    checkIn,
    submitScore,
  };
}
