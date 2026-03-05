'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import useSafeTexture from '../../hooks/useSafeTexture';
import * as THREE from 'three';
import { getRandomMedia, Media } from '../../lib/uploadthing';
import { useOptionalAudioContext } from '@/app/context/AudioContext';

/**
 * @file SurveillanceScreens.tsx
 * @description 4 écrans de surveillance sur le mur gauche
 * @author Agent 3 - Three.js Environment
 * 
 * INTÉGRATION AUDIO (Agent 5):
 * - Joue un bip au survol des écrans (hover)
 */

export interface SurveillanceScreensProps {
  /** Position du groupe d'écrans */
  position?: [number, number, number];
  /** Callback au clic sur un écran */
  onScreenClick?: (screenId: string, media: Media) => void;
  /** Callback au hover */
  onScreenHover?: (screenId: string | null) => void;
}

interface ScreenData {
  id: string;
  position: [number, number, number];
  label: string;
  media: Media;
}

/**
 * Écran individuel de surveillance
 */
function SurveillanceScreen({
  data,
  onClick,
  onHover,
}: {
  data: ScreenData;
  onClick: (id: string, media: Media) => void;
  onHover: (id: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  
  // Accès au contexte audio
  const audioContext = useOptionalAudioContext();

  // Chargement de la texture (avec fallback sécurisé)
  const texture = useSafeTexture(data.media.url);

  useFrame(() => {
    if (!groupRef.current) return;

    // Animation smooth de hover
    const targetScale = hovered ? 1.05 : 1;
    setCurrentScale((prev) => prev + (targetScale - prev) * 0.1);
    groupRef.current.scale.setScalar(currentScale);

    // Pulse de l'émission
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      const baseEmissive = hovered ? 0.5 : 0.2;
      material.emissiveIntensity = baseEmissive + Math.sin(Date.now() * 0.003) * 0.1;
    }
  });

  const handlePointerOver = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    onHover(data.id);
    document.body.style.cursor = 'pointer';
    
    // Jouer un bip au survol
    if (audioContext) {
      audioContext.playHoverBeep();
    }
  }, [data.id, onHover, audioContext]);

  const handlePointerOut = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
    onHover(null);
    document.body.style.cursor = 'default';
  }, [onHover]);

  const handleClick = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(data.id, data.media);
    console.log(`[SecurityRoom] Screen clicked: ${data.id}`);
  }, [data.id, data.media, onClick]);

  // Matériau de l'écran
  const screenMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: texture,
    color: '#ffffff',
    emissive: hovered ? '#223322' : '#112211',
    emissiveIntensity: 0.2,
    roughness: 0.2,
    metalness: 0.1,
  }), [texture, hovered]);

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={[0, Math.PI / 2, 0]}
    >
      {/* Cadre métal sombre */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.7, 1.1, 0.08]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>

      {/* Écran avec texture */}
      <mesh
        ref={screenRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        material={screenMaterial}
      >
        <planeGeometry args={[1.6, 1]} />
      </mesh>

      {/* Label sous l'écran */}
      <Html position={[0, -0.7, 0]} center>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: hovered ? '#00ff41' : '#666666', 
          fontSize: '18px',
          whiteSpace: 'nowrap'
        }}>
          {data.label}
        </div>
      </Html>

      {/* LED indicateur */}
      <mesh position={[0.7, -0.4, 0.02]}>
        <circleGeometry args={[0.03, 8]} />
        <meshBasicMaterial
          color={hovered ? '#00ff00' : '#ff0000'}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Grid 2x2 d'écrans de surveillance
 * Mur gauche de la Security Room
 */
export default function SurveillanceScreens({
  position = [-4.9, 0.5, 0],
  onScreenClick,
  onScreenHover,
}: SurveillanceScreensProps) {
  const { camera } = useThree();

  // Génération des données des 4 écrans avec médias aléatoires
  const screens = useMemo<ScreenData[]>(() => [
    {
      id: 'screen-1',
      position: [0, 1.2, -1.5],
      label: 'CAM-01',
      media: getRandomMedia(),
    },
    {
      id: 'screen-2',
      position: [0, 1.2, 1.5],
      label: 'CAM-02',
      media: getRandomMedia(),
    },
    {
      id: 'screen-3',
      position: [0, -0.8, -1.5],
      label: 'CAM-03',
      media: getRandomMedia(),
    },
    {
      id: 'screen-4',
      position: [0, -0.8, 1.5],
      label: 'CAM-04',
      media: getRandomMedia(),
    },
  ], []);

  return (
    <group position={position}>
      {screens.map((screen) => (
        <SurveillanceScreen
          key={screen.id}
          data={screen}
          onClick={onScreenClick || (() => {})}
          onHover={onScreenHover || (() => {})}
        />
      ))}
    </group>
  );
}
