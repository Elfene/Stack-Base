'use client';

import { useWallet } from '@/hooks/useWallet';
import { Button } from './Button';

export function ConnectWallet() {
  const { login, isConnected, address } = useWallet();

  if (isConnected && address) {
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <span className="text-white/70 text-sm font-mono">{shortAddr}</span>
    );
  }

  return (
    <Button variant="secondary" size="sm" onClick={login}>
      Connect Wallet
    </Button>
  );
}
