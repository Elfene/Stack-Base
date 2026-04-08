'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '@/hooks/useGameState';
import { GAME_CONFIG } from '@/lib/constants';

function Block({ position, size, color }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

export function Tower() {
  const blocks = useGameState((s) => s.blocks);
  const phase = useGameState((s) => s.phase);
  const smoothY = useRef(0);

  useFrame((state) => {
    const topBlockY = blocks.length > 0
      ? blocks[blocks.length - 1].position[1]
      : 0;

    smoothY.current = THREE.MathUtils.lerp(
      smoothY.current,
      topBlockY,
      GAME_CONFIG.CAMERA_LERP_FACTOR,
    );

    const time = state.clock.getElapsedTime();
    const swayX = Math.sin(time * 0.1) * 0.3;
    const swayZ = Math.cos(time * 0.1) * 0.3;

    state.camera.position.set(
      10 + swayX,
      10 + smoothY.current,
      10 + swayZ,
    );
    state.camera.lookAt(0, smoothY.current, 0);
    state.camera.updateProjectionMatrix();
  });

  return (
    <>
      {blocks.map((block, i) => (
        <Block
          key={i}
          position={block.position}
          size={block.size}
          color={block.color}
        />
      ))}
    </>
  );
}
