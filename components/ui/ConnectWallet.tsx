'use client';

import { useWallet } from '@/hooks/useWallet';
import { Button } from './Button';

export function ConnectWallet() {
  const { login, logout, authenticated, address, ready } = useWallet();

  if (!ready) return null;

  if (authenticated && address) {
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="flex items-center gap-3">
        <span className="text-white/70 text-sm font-mono">{shortAddr}</span>
        <Button variant="ghost" size="sm" onClick={logout}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" size="md" onClick={login}>
      Connect Wallet
    </Button>
  );
}
