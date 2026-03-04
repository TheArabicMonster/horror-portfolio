'use client';

import { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';
import { getRandomMedia } from '../../lib/uploadthing';

/**
 * @file Desk.tsx
 * @description Bureau avec écrans et chaise
 * @author Agent 3 - Three.js Environment
 */

export interface DeskProps {
  /** Position du bureau */
  position?: [number, number, number];
}

interface SmallScreenProps {
  position: [number, number, number];
  rotation: [number, number, number];
  label: string;
}

/**
 * Petit écran sur le bureau
 */
function SmallScreen({ position, rotation, label }: SmallScreenProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Texture aléatoire
  const media = useMemo(() => getRandomMedia(), []);
  const texture = useTexture(media.url);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = hovered ? 0.5 : 0.2;
  });

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    color: '#ffffff',
    emissive: '#112211',
    emissiveIntensity: 0.2,
    roughness: 0.3,
  }), [texture]);

  return (
    <group position={position} rotation={rotation}>
      {/* Support de l'écran */}
      <mesh position={[0, -0.15, -0.05]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.25, -0.05]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.7} />
      </mesh>

      {/* Cadre de l'écran */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[0.6, 0.4, 0.04]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Écran */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        material={screenMaterial}
      >
        <planeGeometry args={[0.55, 0.35]} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.28, 0]}
        fontSize={0.05}
        color={hovered ? '#00ff41' : '#666666'}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/vt323/v17/pxiKyp0ihIEF2isfFJU.woff2"
      >
        {label}
    </Text>
    </group>
  );
}

/**
 * Bureau avec écrans et chaise
 */
export default function Desk({
  position = [0, -0.8, 2],
}: DeskProps) {
  // Matériaux mémoïsés
  const deskMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#3a3a3a',
    roughness: 0.6,
    metalness: 0.4,
  }), []);

  const legMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.7,
    metalness: 0.3,
  }), []);

  const chairMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.9,
  }), []);

  return (
    <group position={position}>
      {/* Plateau du bureau */}
      <mesh position={[0, 0.4, 0]} material={deskMaterial} castShadow receiveShadow>
        <boxGeometry args={[4, 0.1, 1.5]} />
      </mesh>

      {/* Pieds du bureau */}
      <mesh position={[-1.5, -0.3, 0.4]} material={legMaterial} castShadow>
        <boxGeometry args={[0.1, 1.4, 0.5]} />
      </mesh>
      <mesh position={[1.5, -0.3, 0.4]} material={legMaterial} castShadow>
        <boxGeometry args={[0.1, 1.4, 0.5]} />
      </mesh>
      <mesh position={[-1.5, -0.3, -0.4]} material={legMaterial} castShadow>
        <boxGeometry args={[0.1, 1.4, 0.5]} />
      </mesh>
      <mesh position={[1.5, -0.3, -0.4]} material={legMaterial} castShadow>
        <boxGeometry args={[0.1, 1.4, 0.5]} />
      </mesh>

      {/* Petit écran gauche */}
      <SmallScreen
        position={[-1.2, 0.65, 0.2]}
        rotation={[-0.2, 0.2, 0]}
        label="CAM-01"
      />

      {/* Petit écran centre */}
      <SmallScreen
        position={[0, 0.65, 0.3]}
        rotation={[-0.15, 0, 0]}
        label="MAIN"
      />

      {/* Petit écran droite */}
      <SmallScreen
        position={[1.2, 0.65, 0.2]}
        rotation={[-0.2, -0.2, 0]}
        label="CAM-02"
      />

      {/* Clavier */}
      <mesh position={[0, 0.46, -0.2]}>
        <boxGeometry args={[1, 0.03, 0.4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Souris */}
      <mesh position={[0.7, 0.46, -0.2]}>
        <boxGeometry args={[0.12, 0.04, 0.18]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>

      {/* Chaise - Siège */}
      <mesh position={[0, -0.4, 1.2]} material={chairMaterial} castShadow>
        <boxGeometry args={[1.2, 0.15, 1.2]} />
      </mesh>

      {/* Chaise - Dossier */}
      <mesh position={[0, 0.2, 1.7]} material={chairMaterial} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.1]} />
      </mesh>

      {/* Chaise - Accoudoirs */}
      <mesh position={[-0.55, 0, 1.2]} material={chairMaterial} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
      </mesh>
      <mesh position={[0.55, 0, 1.2]} material={chairMaterial} castShadow>
        <boxGeometry args={[0.1, 0.5, 0.6]} />
      </mesh>

      {/* Chaise - Pied central */}
      <mesh position={[0, -0.8, 1.2]} material={legMaterial} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
      </mesh>

      {/* Chaise - Base étoile */}
      <mesh position={[0, -1.2, 1.2]} material={legMaterial} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.05, 5]} />
      </mesh>

      {/* Câbles sous le bureau */}
      <mesh position={[-0.5, -0.95, 0]} rotation={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.5, 6]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  );
}
