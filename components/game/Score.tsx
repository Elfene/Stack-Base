'use client';

import { useGameState } from '@/hooks/useGameState';
import { useSpring, animated } from '@react-spring/web';
import { useEffect, useRef } from 'react';

export function Score() {
  const score = useGameState((s) => s.score);
  const phase = useGameState((s) => s.phase);
  const prevScore = useRef(score);

  const [spring, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 400, friction: 10 },
  }));

  useEffect(() => {
    if (score !== prevScore.current) {
      api.start({
        from: { scale: 1.3 },
        to: { scale: 1 },
      });
      prevScore.current = score;
    }
  }, [score, api]);

  if (phase === 'idle') return null;

  return (
    <animated.div
      style={{
        transform: spring.scale.to((s) => `scale(${s})`),
      }}
      className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none"
    >
      <div className="text-7xl font-bold text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] tabular-nums">
        {score}
      </div>
    </animated.div>
  );
}
