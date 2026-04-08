'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Tower } from './Tower';
import { MovingBlock, MovingBlockRef } from './MovingBlock';
import { FallingPiece } from './FallingPiece';
import { Particles } from './Particles';
import { useGameState } from '@/hooks/useGameState';

export function GameCanvas() {
  const phase = useGameState((s) => s.phase);
  const dropBlock = useGameState((s) => s.dropBlock);
  const startGame = useGameState((s) => s.startGame);
  const resetGame = useGameState((s) => s.resetGame);
  const movingBlockRef = useRef<MovingBlockRef>(null);

  const handleDrop = useCallback(() => {
    if (phase === 'idle') {
      startGame();
      return null;
    }
    if (phase !== 'playing') return null;

    const pos = movingBlockRef.current?.getCurrentPos() ?? 0;
    return dropBlock(pos);
  }, [phase, dropBlock, startGame]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__gameHandleDrop = handleDrop;
    return () => {
      delete (window as unknown as Record<string, unknown>).__gameHandleDrop;
    };
  }, [handleDrop]);

  return (
    <div className="absolute inset-0">
      <Canvas
        orthographic
        camera={{
          zoom: 50,
          position: [10, 10, 10],
          near: -100,
          far: 200,
        }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-5, 10, -5]} intensity={0.3} />

        <Tower />
        {phase === 'playing' && <MovingBlock ref={movingBlockRef} />}
        <FallingPiece />
        <Particles />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.3, 0]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <shadowMaterial transparent opacity={0.15} />
        </mesh>
      </Canvas>
    </div>
  );
}
