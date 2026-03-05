'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import useSafeTexture from '../../hooks/useSafeTexture';
import * as THREE from 'three';
import { getRandomMedia, Media } from '../../lib/uploadthing';

/**
 * @file MainScreen.tsx
 * @description Grand écran principal au fond de la pièce
 * @author Agent 3 - Three.js Environment
 */

export interface MainScreenProps {
  /** Position de l'écran */
  position?: [number, number, number];
  /** Largeur de l'écran */
  width?: number;
  /** Hauteur de l'écran */
  height?: number;
  /** Callback au clic */
  onClick?: () => void;
}

/**
 * Grand écran principal style FNAF
 * Affiche un média aléatoire au chargement
 */
export default function MainScreen({
  position = [0, 0.5, -4.9],
  width = 4,
  height = 2.5,
  onClick,
}: MainScreenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<Media | null>(null);

  // Charger un média aléatoire au montage
  useEffect(() => {
    setCurrentMedia(getRandomMedia());
  }, []);

  // Texture du média (avec fallback sécurisé)
  const texture = useSafeTexture(currentMedia?.url);

  useFrame((state) => {
    if (!groupRef.current || !screenRef.current || !lightRef.current) return;

    const time = state.clock.elapsedTime;

    // Légère pulsation de la lumière émise
    const pulse = 0.8 + Math.sin(time * 1.5) * 0.2;
    lightRef.current.intensity = hovered ? pulse * 1.5 : pulse;

    // Effet de scanline subtil
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = hovered ? 0.4 : 0.25;
    }
  });

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick?.();
    // Changer le média au clic
    setCurrentMedia(getRandomMedia());
  };

  // Matériau de l'écran avec émission
  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    color: '#ffffff',
    emissive: '#112244',
    emissiveIntensity: 0.25,
    roughness: 0.2,
    metalness: 0.1,
  }), [texture]);

  // Dimensions du cadre
  const frameWidth = width + 0.2;
  const frameHeight = height + 0.2;

  return (
    <group ref={groupRef} position={position}>
      {/* Lumière émise depuis l'écran */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 1]}
        color="#4488ff"
        intensity={1}
        distance={6}
        decay={2}
      />

      {/* Cadre métal épais */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[frameWidth, frameHeight, 0.15]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>

      {/* Bordure intérieure */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[width + 0.05, height + 0.05, 0.04]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.8}
        />
      </mesh>

      {/* Écran principal */}
      <mesh
        ref={screenRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        material={screenMaterial}
      >
        <planeGeometry args={[width, height]} />
      </mesh>

      {/* Overlay scanline */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* Indicateur de statut (LED verte) */}
      <mesh position={[-width / 2 + 0.15, -height / 2 + 0.15, 0.02]}>
        <circleGeometry args={[0.05, 8]} />
        <meshBasicMaterial color="#00ff00" toneMapped={false} />
      </mesh>

      {/* Label sous l'écran */}
      <mesh position={[0, -height / 2 - 0.2, 0]}>
        <planeGeometry args={[2, 0.25]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      <Html position={[0, -height / 2 - 0.2, 0.01]} center>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: '#00ff41', 
          fontSize: '24px',
          whiteSpace: 'nowrap'
        }}>
          MAIN DISPLAY - {currentMedia?.type.toUpperCase() || 'STANDBY'}
        </div>
      </Html>

      {/* Coins renforcés (style industriel) */}
      {[
        [-width / 2 + 0.1, height / 2 - 0.1],
        [width / 2 - 0.1, height / 2 - 0.1],
        [-width / 2 + 0.1, -height / 2 + 0.1],
        [width / 2 - 0.1, -height / 2 + 0.1],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.05]}>
          <boxGeometry args={[0.15, 0.15, 0.1]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.6}
            metalness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}
