'use client';

import { useGameState } from '@/hooks/useGameState';
import { useSpring, animated } from '@react-spring/web';
import { useEffect } from 'react';

export function PerfectPopup() {
  const showPerfect = useGameState((s) => s.showPerfect);
  const setShowPerfect = useGameState((s) => s.setShowPerfect);
  const combo = useGameState((s) => s.combo);

  const [spring, api] = useSpring(() => ({
    opacity: 0,
    scale: 0,
    y: 0,
    config: { tension: 300, friction: 15 },
  }));

  useEffect(() => {
    if (showPerfect) {
      api.start({
        from: { opacity: 1, scale: 0, y: 0 },
        to: [
          { opacity: 1, scale: 1.2 },
          { scale: 1 },
          { opacity: 0, y: -40 },
        ],
        onRest: () => setShowPerfect(false),
      });
    }
  }, [showPerfect, api, setShowPerfect]);

  return (
    <animated.div
      style={{
        opacity: spring.opacity,
        transform: spring.scale.to((s) => {
          const yVal = spring.y.get();
          return `translate(-50%, calc(-50% + ${yVal}px)) scale(${s})`;
        }),
        pointerEvents: 'none' as const,
        position: 'absolute' as const,
        top: '33%',
        left: '50%',
        zIndex: 30,
        userSelect: 'none' as const,
      }}
    >
      <div className="text-4xl font-bold text-yellow-300 drop-shadow-[0_2px_10px_rgba(255,215,0,0.6)] whitespace-nowrap text-center">
        {combo > 1 ? `PERFECT! x${combo}` : 'PERFECT!'}
      </div>
      <div className="text-xl font-semibold text-white text-center mt-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
        +{2 + Math.min(combo, 5)}
      </div>
    </animated.div>
  );
}
