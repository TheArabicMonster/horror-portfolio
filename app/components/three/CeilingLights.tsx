'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * @file CeilingLights.tsx
 * @description Néons clignotants au plafond style FNAF
 * @author Agent 3 - Three.js Environment
 */

export interface CeilingLightsProps {
  /** Position Y des néons (sous le plafond) */
  height?: number;
  /** Distance entre les deux néons */
  spacing?: number;
  /** Couleur des néons */
  color?: string;
  /** Intensité de base */
  intensity?: number;
  /** Taux de flickering (0-1) */
  flickerRate?: number;
  /** Longueur des tubes */
  tubeLength?: number;
}

/**
 * Deux néons longs avec effet de clignotement aléatoire
 * Style lumières défectueuses des jeux FNAF
 */
export default function CeilingLights({
  height = 2.7,
  spacing = 3,
  color = '#e0e8ff',
  intensity = 1.5,
  flickerRate = 0.12,
  tubeLength = 1.5,
}: CeilingLightsProps) {
  const leftLightRef = useRef<THREE.PointLight>(null);
  const rightLightRef = useRef<THREE.PointLight>(null);
  const leftMeshRef = useRef<THREE.Mesh>(null);
  const rightMeshRef = useRef<THREE.Mesh>(null);

  // Pattern de flickering pré-calculé
  const flickerPattern = useMemo(() => {
    return Array.from({ length: 30 }, () => ({
      threshold: Math.random(),
      intensity: 0.2 + Math.random() * 0.8,
      duration: 0.03 + Math.random() * 0.15,
    }));
  }, []);

  let flickerIndex = 0;
  let lastFlickerTime = 0;

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Mise à jour du flickering
    if (time - lastFlickerTime > flickerPattern[flickerIndex].duration) {
      flickerIndex = (flickerIndex + 1) % flickerPattern.length;
      lastFlickerTime = time;

      const pattern = flickerPattern[flickerIndex];

      // Chance de flicker basée sur le taux
      if (Math.random() < flickerRate) {
        const newIntensity = intensity * pattern.intensity;
        
        if (leftLightRef.current) leftLightRef.current.intensity = newIntensity;
        if (rightLightRef.current) rightLightRef.current.intensity = newIntensity;
        
        if (leftMeshRef.current) {
          const mat = leftMeshRef.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = newIntensity * 0.5;
        }
        if (rightMeshRef.current) {
          const mat = rightMeshRef.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = newIntensity * 0.5;
        }
      } else {
        // Intensité normale
        if (leftLightRef.current) leftLightRef.current.intensity = intensity;
        if (rightLightRef.current) rightLightRef.current.intensity = intensity;
        
        if (leftMeshRef.current) {
          const mat = leftMeshRef.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = intensity * 0.5;
        }
        if (rightMeshRef.current) {
          const mat = rightMeshRef.current.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = intensity * 0.5;
        }
      }
    }
  });

  const tubeMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: intensity * 0.5,
    toneMapped: false,
  }), [color, intensity]);

  return (
    <group>
      {/* Néon Gauche */}
      <group position={[-spacing / 2, height, 0]}>
        {/* Tube néon */}
        <mesh 
          ref={leftMeshRef}
          rotation={[Math.PI / 2, 0, 0]}
          material={tubeMaterial}
        >
          <cylinderGeometry args={[0.04, 0.04, tubeLength, 8]} />
        </mesh>
        
        {/* PointLight pour éclairer */}
        <pointLight
          ref={leftLightRef}
          color={color}
          intensity={intensity}
          distance={8}
          decay={2}
          position={[0, -0.5, 0]}
        />
        
        {/* Glow local */}
        <pointLight
          color={color}
          intensity={intensity * 0.3}
          distance={2}
          decay={2}
        />
      </group>

      {/* Néon Droite */}
      <group position={[spacing / 2, height, 0]}>
        {/* Tube néon */}
        <mesh 
          ref={rightMeshRef}
          rotation={[Math.PI / 2, 0, 0]}
          material={tubeMaterial}
        >
          <cylinderGeometry args={[0.04, 0.04, tubeLength, 8]} />
        </mesh>
        
        {/* PointLight pour éclairer */}
        <pointLight
          ref={rightLightRef}
          color={color}
          intensity={intensity}
          distance={8}
          decay={2}
          position={[0, -0.5, 0]}
        />
        
        {/* Glow local */}
        <pointLight
          color={color}
          intensity={intensity * 0.3}
          distance={2}
          decay={2}
        />
      </group>
    </group>
  );
}
