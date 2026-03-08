'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/**
 * @file CameraController.tsx
 * @description Contrôleur de caméra pour la Security Room
 * @author Agent 3 - Three.js Environment
 */

export interface CameraControllerProps {
  /** Type de contrôles */
  mode?: 'pointerLock' | 'orbit';
  /** Position initiale de la caméra */
  initialPosition?: [number, number, number];
  /** Cible à regarder */
  target?: [number, number, number];
  /** Limites de rotation horizontale (radians) */
  minAzimuthAngle?: number;
  /** Limites de rotation horizontale (radians) */
  maxAzimuthAngle?: number;
  /** Limites de rotation verticale (radians) */
  minPolarAngle?: number;
  /** Limites de rotation verticale (radians) */
  maxPolarAngle?: number;
  /** Activer/désactiver le zoom */
  enableZoom?: boolean;
  /** Activer/désactiver le pan */
  enablePan?: boolean;
  /** Activer/désactiver les contrôles */
  enabled?: boolean;
}

/**
 * Contrôleur de caméra avec PointerLock ou OrbitControls
 * Position initiale: Vector3(0, 1.6, 4) - hauteur humaine debout
 */
export default function CameraController({
  mode = 'orbit',
  initialPosition = [0, 1.6, 4],
  target = [0, 1, 0],
  minAzimuthAngle = -Math.PI / 3,
  maxAzimuthAngle = Math.PI / 3,
  minPolarAngle = Math.PI / 3,
  maxPolarAngle = Math.PI / 1.8,
  enableZoom = false,
  enablePan = false,
  enabled = true,
}: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Position initiale de la caméra
  useEffect(() => {
    camera.position.set(...initialPosition);
    camera.lookAt(...target);
  }, [camera, initialPosition, target]);

  // Mode PointerLock
  const handleLock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const handleUnlock = useCallback(() => {
    setIsLocked(false);
  }, []);

  if (mode === 'pointerLock') {
    return (
      <>
        <PointerLockControls
          ref={controlsRef}
          onLock={handleLock}
          onUnlock={handleUnlock}
        />
        {/* Instructions pour le mode PointerLock */}
        {!isLocked && (
          <mesh position={[0, 1, -2]} rotation={[0, 0, 0]}>
            <planeGeometry args={[3, 1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
        )}
      </>
    );
  }

  // Mode OrbitControls (par défaut)
  return (
    <OrbitControls
      ref={controlsRef}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      enableZoom={enableZoom}
      enablePan={enablePan}
      target={target}
      makeDefault
      enabled={enabled}
    />
  );
}
