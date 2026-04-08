'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '@/hooks/useGameState';
import { GAME_CONFIG } from '@/lib/constants';
import { getBlockColor } from '@/lib/colors';

export interface MovingBlockRef {
  getCurrentPos: () => number;
}

export const MovingBlock = forwardRef<MovingBlockRef>(function MovingBlock(_, ref) {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(-Math.PI / 2);

  const blocks = useGameState((s) => s.blocks);
  const currentBlockSize = useGameState((s) => s.currentBlockSize);
  const moveAxis = useGameState((s) => s.moveAxis);
  const speed = useGameState((s) => s.speed);
  const phase = useGameState((s) => s.phase);

  const lastBlock = blocks[blocks.length - 1];
  const color = getBlockColor(blocks.length);
  const y = lastBlock
    ? lastBlock.position[1] + GAME_CONFIG.BLOCK_HEIGHT
    : GAME_CONFIG.BLOCK_HEIGHT;

  useEffect(() => {
    timeRef.current = -Math.PI / 2;
  }, [blocks.length]);

  useImperativeHandle(ref, () => ({
    getCurrentPos: () => {
      if (!meshRef.current) return 0;
      return moveAxis === 'x'
        ? meshRef.current.position.x
        : meshRef.current.position.z;
    },
  }));

  useFrame((_, delta) => {
    if (!meshRef.current || phase !== 'playing') return;

    timeRef.current += delta * speed;
    const swingPos = Math.sin(timeRef.current) * GAME_CONFIG.SWING_AMPLITUDE;

    if (moveAxis === 'x') {
      meshRef.current.position.x = swingPos;
      meshRef.current.position.z = lastBlock?.position[2] ?? 0;
    } else {
      meshRef.current.position.z = swingPos;
      meshRef.current.position.x = lastBlock?.position[0] ?? 0;
    }
    meshRef.current.position.y = y;
  });

  return (
    <mesh ref={meshRef} position={[0, y, 0]} castShadow>
      <boxGeometry args={currentBlockSize} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
});
