'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useGameState } from '@/hooks/useGameState';
import { Score } from '@/components/game/Score';
import { GameOver } from '@/components/game/GameOver';
import { PerfectPopup } from '@/components/game/PerfectPopup';
import { useRouter } from 'next/navigation';

const GameCanvas = dynamic(
  () => import('@/components/game/GameCanvas').then((m) => ({ default: m.GameCanvas })),
  { ssr: false },
);

export default function GamePage() {
  const router = useRouter();
  const phase = useGameState((s) => s.phase);
  const startGame = useGameState((s) => s.startGame);
  const resetGame = useGameState((s) => s.resetGame);
  const [showHint, setShowHint] = useState(true);
  const audioRef = useRef<{ drop?: HTMLAudioElement; perfect?: HTMLAudioElement; gameover?: HTMLAudioElement }>({});

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = {
        drop: new Audio('/sounds/drop.mp3'),
        perfect: new Audio('/sounds/perfect.mp3'),
        gameover: new Audio('/sounds/gameover.mp3'),
      };
      Object.values(audioRef.current).forEach((a) => {
        if (a) a.volume = 0.3;
      });
    }
  }, []);

  const playSound = useCallback((name: 'drop' | 'perfect' | 'gameover') => {
    const audio = audioRef.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const handleTap = useCallback(() => {
    if (phase === 'idle') {
      startGame();
      setShowHint(true);
      return;
    }

    if (phase === 'playing') {
      setShowHint(false);
      const handler = (window as unknown as Record<string, () => string | null>).__gameHandleDrop;
      if (!handler) return;
      const result = handler();

      if (result === 'perfect') {
        playSound('perfect');
        if (navigator.vibrate) navigator.vibrate(50);
      } else if (result === 'placed') {
        playSound('drop');
        if (navigator.vibrate) navigator.vibrate(20);
      } else if (result === 'gameover') {
        playSound('gameover');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    }
  }, [phase, startGame, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setTimeout(() => startGame(), 50);
    setShowHint(true);
  }, [resetGame, startGame]);

  return (
    <div
      className="h-full game-gradient relative select-none touch-none"
      onClick={handleTap}
    >
      <GameCanvas />

      {/* Back button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push('/');
        }}
        className="absolute top-6 left-6 z-20 text-white/60 hover:text-white transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>

      <Score />
      <PerfectPopup />
      <GameOver onPlayAgain={handlePlayAgain} />

      {/* Start prompt */}
      {phase === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-white text-glow mb-4">BlockStack</h2>
            <p className="text-white/60 text-lg animate-pulse-slow">Tap to start</p>
          </div>
        </div>
      )}

      {/* First block hint */}
      {phase === 'playing' && showHint && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <p className="text-white/50 text-sm animate-pulse-slow whitespace-nowrap">
            Click or press Space to drop
          </p>
        </div>
      )}
    </div>
  );
}
