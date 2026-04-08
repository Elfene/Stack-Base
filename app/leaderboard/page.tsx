'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useSpring, animated } from '@react-spring/web';
import { useAccount } from 'wagmi';

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(timestamp: number) {
  if (!timestamp) return '—';
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { entries, isLoading } = useLeaderboard(50);
  const { address } = useAccount();

  const headerSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
  });

  const hasEntries = entries.length > 0;

  const demoEntries = hasEntries
    ? entries
    : Array.from({ length: 10 }, (_, i) => ({
        player: `0x${(i + 1).toString(16).padStart(40, '0')}`,
        score: Math.max(100 - i * 8, 5),
        timestamp: Math.floor(Date.now() / 1000) - i * 86400,
      }));

  return (
    <div className="h-full game-gradient overflow-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <animated.div
          style={{
            opacity: headerSpring.opacity,
            transform: headerSpring.y.to((y) => `translateY(${y}px)`),
          }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-white text-glow">Leaderboard</h1>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/game')}
          >
            Play
          </Button>
        </animated.div>

        {/* Table */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[60px_1fr_100px_80px] px-6 py-4 text-sm font-semibold text-white/50 border-b border-white/10">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Score</span>
            <span className="text-right">Date</span>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="px-6 py-12 text-center text-white/40">
              Loading scores...
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {demoEntries.map((entry, i) => {
                const isCurrentPlayer =
                  address?.toLowerCase() === entry.player.toLowerCase();
                const rankColors = [
                  'text-yellow-300',
                  'text-gray-300',
                  'text-amber-500',
                ];

                return (
                  <div
                    key={i}
                    className={`grid grid-cols-[60px_1fr_100px_80px] px-6 py-4 items-center transition-colors ${
                      isCurrentPlayer
                        ? 'bg-white/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={`font-bold text-lg ${
                        rankColors[i] || 'text-white/40'
                      }`}
                    >
                      #{i + 1}
                    </span>
                    <span
                      className={`font-mono text-sm ${
                        isCurrentPlayer ? 'text-white font-bold' : 'text-white/70'
                      }`}
                    >
                      {shortenAddress(entry.player)}
                      {isCurrentPlayer && (
                        <span className="ml-2 text-xs text-yellow-300">(you)</span>
                      )}
                    </span>
                    <span className="text-right font-bold text-white tabular-nums">
                      {entry.score}
                    </span>
                    <span className="text-right text-sm text-white/40">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {!hasEntries && !isLoading && (
            <div className="px-6 py-4 text-center text-white/30 text-sm border-t border-white/10">
              Demo data shown — connect contract to see live scores
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
