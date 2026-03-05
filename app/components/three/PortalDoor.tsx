'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Types pour les événements Three.js
type ThreeEvent = { stopPropagation: () => void };

/**
 * @file PortalDoor.tsx
 * @description Porte/Portail vers une galerie
 * @author Agent 3 - Three.js Environment
 */

export interface PortalDoorProps {
  /** Position [x, y, z] */
  position: [number, number, number];
  /** Label au-dessus de la porte */
  label: string;
  /** Callback au clic */
  onClick?: () => void;
  /** Couleur du portail */
  color?: string;
  /** Rotation [x, y, z] */
  rotation?: [number, number, number];
  /** Taille [largeur, hauteur] */
  size?: [number, number];
  /** Type de média pour le style */
  mediaType: 'illustrations' | 'photos' | 'videos';
}

/**
 * Porte métallique style industriel avec portail lumineux
 * Mène vers les différentes galeries
 */
export default function PortalDoor({
  position,
  label,
  onClick,
  color = '#00ff41',
  rotation = [0, 0, 0],
  size = [1.8, 2.5],
  mediaType,
}: PortalDoorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const portalRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);
  
  // Couleurs selon le type de média
  const typeColors = useMemo(() => ({
    illustrations: '#00ff41', // Vert terminal
    photos: '#ffb000',        // Ambre
    videos: '#8b0000',        // Rouge sang
  }), []);
  
  const portalColor = typeColors[mediaType];
  
  // Particules flottantes
  const particles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * size[0] * 0.8,
      y: Math.random() * size[1],
      z: (Math.random() - 0.5) * 0.3,
      speed: 0.5 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, [size]);
  
  useFrame((state) => {
    if (!groupRef.current || !portalRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Animation de hover
    const targetScale = hovered ? 1.05 : 1;
    setCurrentScale(prev => prev + (targetScale - prev) * 0.1);
    groupRef.current.scale.setScalar(currentScale);
    
    // Pulse du portail
    const material = portalRef.current.material as THREE.MeshStandardMaterial;
    const pulse = 0.5 + Math.sin(time * 2) * 0.2 + (hovered ? 0.3 : 0);
    material.emissiveIntensity = pulse;
    
    // Rotation légère du portail
    portalRef.current.rotation.z = Math.sin(time * 0.5) * 0.02;
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
  };
  
  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
    >
      {/* Cadre métallique */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[size[0] + 0.2, size[1] + 0.2, 0.15]} />
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.6}
          metalness={0.8}
        />
      </mesh>
      
      {/* Contour lumineux */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, 0.02]} />
        <meshStandardMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Portail lumineux (surface cliquable) */}
      <mesh
        ref={portalRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Barre horizontale au milieu (style porte industrielle) */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[size[0] - 0.1, 0.1, 0.02]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>
      
      {/* Poignée */}
      <mesh position={[size[0]/2 - 0.15, 0, 0.05]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial
          color="#4a4a4a"
          metalness={0.9}
          roughness={0.3}
        />
      </mesh>
      
      {/* Label au-dessus */}
      <Html position={[0, size[1]/2 + 0.25, 0]} center>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: portalColor, 
          fontSize: '28px',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </div>
      </Html>
      
      {/* Ligne indicateur sous le label */}
      <mesh position={[0, size[1]/2 + 0.15, 0]}>
        <boxGeometry args={[size[0] * 0.6, 0.02, 0.01]} />
        <meshBasicMaterial color={portalColor} />
      </mesh>
      
      {/* Particules flottantes (effet magique/énergie) */}
      {hovered && particles.map((p) => (
        <mesh
          key={p.id}
          position={[
            p.x,
            p.y + Math.sin(particles[0].offset + particles[0].speed) * 0.1,
            p.z + 0.1
          ]}
        >
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial
            color={portalColor}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
