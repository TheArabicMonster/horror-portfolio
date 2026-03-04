'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * @file FlickeringLight.tsx
 * @description Lumière néon clignotante style FNAF
 * @author Agent 3 - Three.js Environment
 */

export interface FlickeringLightProps {
  /** Position de la lumière [x, y, z] */
  position: [number, number, number];
  /** Couleur de la lumière (hex) */
  color?: string;
  /** Intensité maximale */
  intensity?: number;
  /** Distance d'éclairage */
  distance?: number;
  /** Taux de clignotement (plus élevé = plus de flicker) */
  flickerRate?: number;
  /** Angle du cône de lumière (pour SpotLight) */
  angle?: number;
  /** Pénombre du cône */
  penumbra?: number;
  /** Décroissance */
  decay?: number;
}

/**
 * Lumière néon avec effet de clignotement aléatoire
 * Simule les néons défectueux des jeux FNAF
 */
export default function FlickeringLight({
  position,
  color = '#00ff41',
  intensity = 1,
  distance = 10,
  flickerRate = 0.15,
  angle = Math.PI / 4,
  penumbra = 0.5,
  decay = 2,
}: FlickeringLightProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Valeurs aléatoires pré-calculées pour éviter les recalculs
  const flickerPattern = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      threshold: Math.random(),
      intensity: 0.3 + Math.random() * 0.7,
    }));
  }, []);
  
  let flickerIndex = 0;
  let lastFlickerTime = 0;
  
  useFrame((state) => {
    if (!lightRef.current || !meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Changement de pattern de flicker toutes les 0.05-0.2s
    if (time - lastFlickerTime > 0.05 + Math.random() * 0.15) {
      flickerIndex = (flickerIndex + 1) % flickerPattern.length;
      lastFlickerTime = time;
      
      const pattern = flickerPattern[flickerIndex];
      
      // 15% de chance d'avoir un flicker (baisse d'intensité)
      if (Math.random() < flickerRate) {
        const newIntensity = intensity * pattern.intensity;
        lightRef.current.intensity = newIntensity;
        
        // Mise à jour de l'émission du mesh du néon
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = newIntensity * 0.5;
      } else {
        // Intensité normale
        lightRef.current.intensity = intensity;
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = intensity * 0.5;
      }
    }
  });
  
  return (
    <group position={position}>
      {/* Tube néon visible */}
      <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity * 0.5}
          toneMapped={false}
        />
      </mesh>
      
      {/* SpotLight pour éclairer la pièce */}
      <spotLight
        ref={lightRef}
        color={color}
        intensity={intensity}
        distance={distance}
        angle={angle}
        penumbra={penumbra}
        decay={decay}
        castShadow={false}
        position={[0, -0.5, 0]}
        target-position={[0, -5, 0]}
      />
      
      {/* PointLight pour le glow local */}
      <pointLight
        color={color}
        intensity={intensity * 0.3}
        distance={2}
        decay={2}
      />
    </group>
  );
}
