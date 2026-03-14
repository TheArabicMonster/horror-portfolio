'use client';

/**
 * @file DoorPortals.tsx
 * @description 3 portes/portails sur le mur droit - Intégré avec AppContext
 * @author Agent 3 - Three.js Environment / Agent 6 - Routing & State Management
 * 
 * INTÉGRATION:
 * - onClick porte → openGallery(type) via AppContext
 * - Peut aussi afficher MediaViewer directement pour preview
 */

import { useRef, useState, useMemo, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useOptionalAudioContext } from '@/app/context/AudioContext';
import { useOptionalAppContext } from '@/app/context/AppContext';
import { type MediaType } from '@/app/lib/uploadthing';

/**
 * @file DoorPortals.tsx
 * @description 3 portes/portails sur le mur droit
 * @author Agent 3 - Three.js Environment
 * 
 * INTÉGRATION AUDIO (Agent 5):
 * - Joue un grincement de porte au clic sur un portail
 * 
 * INTÉGRATION ROUTING (Agent 6):
 * - Connecté à AppContext pour la navigation
 */

export interface DoorPortalsProps {
  /** Position du groupe de portes */
  position?: [number, number, number];
  /** Callback au clic sur un portail (optionnel, sinon utilise AppContext) */
  onPortalClick?: (type: MediaType) => void;
  /** Mode preview: affiche un média au lieu d'ouvrir la galerie */
  previewMode?: boolean;
}

interface PortalData {
  id: MediaType;
  position: [number, number, number];
  label: string;
  color: string;
  hoverColor: string;
}

/**
 * Porte individuelle style industriel/métal
 */
function PortalDoor({
  data,
  onClick,
}: {
  data: PortalData;
  onClick: (type: MediaType) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  useFrame((state) => {
    if (!groupRef.current || !portalRef.current) return;

    const time = state.clock.elapsedTime;

    // Animation de hover smooth
    const targetScale = hovered ? 1.08 : 1;
    setCurrentScale((prev) => prev + (targetScale - prev) * 0.1);
    groupRef.current.scale.setScalar(currentScale);

    // Pulse du portail
    const material = portalRef.current.material as THREE.MeshStandardMaterial;
    const pulse = 0.4 + Math.sin(time * 2) * 0.15 + (hovered ? 0.4 : 0);
    material.emissiveIntensity = pulse;

    // Lumière rouge/orange au-dessus quand hover
    if (lightRef.current) {
      lightRef.current.intensity = hovered ? 2 : 0;
    }
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

  const handleClick = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick(data.id);
  }, [data.id, onClick]);

  // Couleurs
  const portalColor = hovered ? data.hoverColor : data.color;

  return (
    <group ref={groupRef} position={data.position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Lumière au-dessus de la porte (activée au hover) */}
      <pointLight
        ref={lightRef}
        position={[0, 1.8, 0.5]}
        color="#ff4400"
        intensity={0}
        distance={4}
        decay={2}
      />

      {/* Cadre métallique épais */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[1.6, 2.4, 0.15]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.6}
          metalness={0.8}
        />
      </mesh>

      {/* Contour lumineux */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[1.5, 2.3, 0.04]} />
        <meshStandardMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Portail lumineux (surface cliquable) */}
      <mesh
        ref={portalRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={0.4}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Barres horizontales (style porte industrielle) */}
      <mesh position={[0, 0.5, 0.02]}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.5, 0.02]}>
        <boxGeometry args={[1.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Poignée */}
      <mesh position={[0.55, 0, 0.06]}>
        <cylinderGeometry args={[0.04, 0.04, 0.25, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Label au-dessus */}
      <Html position={[0, 1.5, 0.1]} center>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: portalColor, 
          fontSize: '32px',
          whiteSpace: 'nowrap'
        }}>
          {data.label}
        </div>
      </Html>

      {/* Ligne indicateur sous le label */}
      <mesh position={[0, 1.35, 0.05]}>
        <boxGeometry args={[1, 0.03, 0.01]} />
        <meshBasicMaterial color={portalColor} />
      </mesh>

      {/* Indicateur de statut (LED) */}
      <mesh position={[-0.6, 1.3, 0.05]}>
        <circleGeometry args={[0.04, 8]} />
        <meshBasicMaterial
          color={hovered ? '#00ff00' : '#ff6600'}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * 3 Portails sur le mur droit
 * ILLUSTRATIONS - PHOTOS - VIDEOS
 * 
 * Intégration AppContext:
 * - Si onPortalClick prop est fourni, l'utilise
 * - Sinon utilise openGallery du AppContext
 */
export default function DoorPortals({
  position = [4.9, 0, 0],
  onPortalClick,
  previewMode = false,
}: DoorPortalsProps) {
  // Accès aux contextes
  const audioContext = useOptionalAudioContext();
  const appContext = useOptionalAppContext();

  // Configuration des 3 portails
  const portals = useMemo<PortalData[]>(() => [
    {
      id: 'photos',
      position: [0, 0, -2],
      label: 'PHOTOS',
      color: '#00ff41',
      hoverColor: '#66ff88',
    },
    {
      id: 'gif',
      position: [0, 0, 0],
      label: 'GIF',
      color: '#ffb000',
      hoverColor: '#ffcc44',
    },
    {
      id: 'videos',
      position: [0, 0, 2],
      label: 'VIDEOS',
      color: '#ff3333',
      hoverColor: '#ff6666',
    },
  ], []);

  const handlePortalClick = useCallback((type: MediaType) => {
    // Jouer le son de grincement de porte
    if (audioContext) {
      audioContext.playDoorCreak();
    }

    // Priorité au callback prop, sinon AppContext
    if (onPortalClick) {
      onPortalClick(type);
    } else if (appContext && !previewMode) {
      // Navigation via AppContext
      appContext.openGallery(type);
    }
  }, [onPortalClick, appContext, audioContext, previewMode]);

  return (
    <group position={position}>
      {portals.map((portal) => (
        <PortalDoor
          key={portal.id}
          data={portal}
          onClick={handlePortalClick}
        />
      ))}
    </group>
  );
}
