'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameState } from '@/hooks/useGameState';

export function FallingPiece() {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef<[number, number, number]>([0, 0, 0]);
  const rotSpeedRef = useRef<[number, number, number]>([0, 0, 0]);
  const fallingPiece = useGameState((s) => s.fallingPiece);
  const clearFallingPiece = useGameState((s) => s.clearFallingPiece);
  const timerRef = useRef(0);

  useEffect(() => {
    if (fallingPiece && meshRef.current) {
      meshRef.current.position.set(...fallingPiece.position);
      meshRef.current.scale.set(1, 1, 1);
      meshRef.current.rotation.set(0, 0, 0);
      velocityRef.current = [...fallingPiece.velocity];
      rotSpeedRef.current = [
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
      ];
      timerRef.current = 0;
    }
  }, [fallingPiece]);

  useFrame((_, delta) => {
    if (!meshRef.current || !fallingPiece) return;

    timerRef.current += delta;

    velocityRef.current[1] -= 15 * delta;

    meshRef.current.position.x += velocityRef.current[0] * delta;
    meshRef.current.position.y += velocityRef.current[1] * delta;
    meshRef.current.position.z += velocityRef.current[2] * delta;

    meshRef.current.rotation.x += rotSpeedRef.current[0] * delta;
    meshRef.current.rotation.y += rotSpeedRef.current[1] * delta;
    meshRef.current.rotation.z += rotSpeedRef.current[2] * delta;

    if (timerRef.current > 2 || meshRef.current.position.y < -10) {
      clearFallingPiece();
    }
  });

  if (!fallingPiece) return null;

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={fallingPiece.size} />
      <meshStandardMaterial
        color={fallingPiece.color}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}
