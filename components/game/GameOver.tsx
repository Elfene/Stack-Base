'use client';

import { useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useSpring, animated } from '@react-spring/web';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useWallet } from '@/hooks/useWallet';

interface GameOverProps {
  onPlayAgain: () => void;
}

export function GameOver({ onPlayAgain }: GameOverProps) {
  const phase = useGameState((s) => s.phase);
  const score = useGameState((s) => s.score);
  const highScore = useGameState((s) => s.highScore);
  const isNewHighScore = score > highScore && highScore > 0;
  const { submitScore, isConnected, login, address } = useWallet();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [spring, api] = useSpring(() => ({
    opacity: 0,
    scale: 0.8,
    config: { tension: 200, friction: 20 },
  }));

  useEffect(() => {
    if (phase === 'gameover') {
      api.start({ opacity: 1, scale: 1 });
      setSubmitted(false);
    } else {
      api.start({ opacity: 0, scale: 0.8 });
    }
  }, [phase, api]);

  const handleSubmitScore = async () => {
    setSubmitting(true);

    const submitToRedis = async () => {
      try {
        const playerAddr = address || `0x${Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`;
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player: playerAddr, score }),
        });
      } catch {}
    };

    if (isConnected) {
      const [onChain] = await Promise.allSettled([
        submitScore(score),
        submitToRedis(),
      ]);
      setSubmitting(false);
      if (onChain.status === 'fulfilled' && onChain.value) {
        setSubmitted(true);
      }
    } else {
      await submitToRedis();
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  if (phase !== 'gameover') return null;

  return (
    <animated.div
      style={{
        opacity: spring.opacity,
        transform: spring.scale.to((s) => `scale(${s})`),
      }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full mx-4 border border-white/20 text-center">
        <h2 className="text-4xl font-bold text-white mb-2">Game Over</h2>

        {isNewHighScore && (
          <div className="text-yellow-300 font-bold text-lg mb-2 animate-pulse">
            New High Score!
          </div>
        )}

        <div className="text-7xl font-bold text-white my-6 tabular-nums">
          {score}
        </div>

        <p className="text-white/60 text-sm mb-6">blocks stacked</p>

        <div className="flex flex-col gap-3">
          <Button onClick={onPlayAgain} variant="primary" size="lg">
            Play Again
          </Button>

          {!submitted && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleSubmitScore();
              }}
              variant="secondary"
              size="lg"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Score'}
            </Button>
          )}

          {submitted && (
            <p className="text-green-400 text-sm font-medium">
              Score submitted!
            </p>
          )}
        </div>
      </div>
    </animated.div>
  );
}
