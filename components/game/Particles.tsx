'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '@/hooks/useGameState';
import { BLOCK_COLORS } from '@/lib/colors';

const PARTICLE_COUNT = 30;

export function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const showPerfect = useGameState((s) => s.showPerfect);
  const blocks = useGameState((s) => s.blocks);
  const activeRef = useRef(false);
  const timerRef = useRef(0);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    return { positions, velocities, colors };
  }, []);

  useEffect(() => {
    if (showPerfect && blocks.length > 0) {
      activeRef.current = true;
      timerRef.current = 0;
      const lastBlock = blocks[blocks.length - 1];
      const [bx, by, bz] = lastBlock.position;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        positions[i3] = bx + (Math.random() - 0.5) * 2;
        positions[i3 + 1] = by;
        positions[i3 + 2] = bz + (Math.random() - 0.5) * 2;

        velocities[i3] = (Math.random() - 0.5) * 6;
        velocities[i3 + 1] = Math.random() * 8 + 3;
        velocities[i3 + 2] = (Math.random() - 0.5) * 6;

        const color = new THREE.Color(
          BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)],
        );
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }

      if (pointsRef.current) {
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
      }
    }
  }, [showPerfect, blocks, positions, velocities, colors]);

  useFrame((_, delta) => {
    if (!activeRef.current || !pointsRef.current) return;

    timerRef.current += delta;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      velocities[i3 + 1] -= 12 * delta;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - timerRef.current / 1.2);

    if (timerRef.current > 1.2) {
      activeRef.current = false;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
