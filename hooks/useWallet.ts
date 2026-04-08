'use client';

import { useAccount, useWriteContract, useReadContract, useSendCalls } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/constants';

const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || '';

let usePrivyHook: () => {
  login: () => void;
  logout: () => void;
  authenticated: boolean;
  ready: boolean;
};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const privyModule = require('@privy-io/react-auth');
  usePrivyHook = privyModule.usePrivy;
} catch {
  usePrivyHook = () => ({
    login: () => {},
    logout: () => {},
    authenticated: false,
    ready: true,
  });
}

export function useWallet() {
  let login = () => {};
  let logout = () => {};
  let authenticated = false;
  let ready = true;

  try {
    const privy = usePrivyHook();
    login = privy.login;
    logout = privy.logout;
    authenticated = privy.authenticated;
    ready = privy.ready;
  } catch {
    // Privy not available
  }

  const { address, isConnected } = useAccount();
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

  async function sponsoredCall(functionName: 'play' | 'checkIn' | 'submitScore', args?: readonly unknown[]) {
    if (PAYMASTER_URL) {
      try {
        await sendCallsAsync({
          calls: [
            {
              to: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName,
              args: args as never,
            },
          ],
          capabilities: {
            paymasterService: {
              url: PAYMASTER_URL,
            },
          },
        });
        return true;
      } catch {
        // fallback to regular tx if paymaster fails
      }
    }

    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName,
      args: args as never,
    });
    return true;
  }

  const play = async () => {
    if (!isConnected) { login(); return false; }
    try { return await sponsoredCall('play'); } catch { return false; }
  };

  const checkIn = async () => {
    if (!isConnected) { login(); return false; }
    try { return await sponsoredCall('checkIn'); } catch { return false; }
  };

  const submitScore = async (score: number) => {
    if (!isConnected) { login(); return false; }
    try { return await sponsoredCall('submitScore', [BigInt(score)]); } catch { return false; }
  };

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
    authenticated,
    ready,
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
