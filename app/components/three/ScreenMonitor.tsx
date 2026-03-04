'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import useSafeTexture from '../../hooks/useSafeTexture';
import * as THREE from 'three';

/**
 * @file ScreenMonitor.tsx
 * @description Écran de surveillance réutilisable
 * @author Agent 3 - Three.js Environment
 */

export interface ScreenMonitorProps {
  /** Position [x, y, z] */
  position: [number, number, number];
  /** Rotation [x, y, z] en radians */
  rotation?: [number, number, number];
  /** Taille [largeur, hauteur] */
  size?: [number, number];
  /** URL de l'image à afficher */
  imageUrl?: string;
  /** Label optionnel affiché sous l'écran */
  label?: string;
  /** Callback au hover */
  onHover?: (isHovered: boolean) => void;
  /** Callback au clic */
  onClick?: () => void;
  /** Émettre de la lumière (glow) */
  emitLight?: boolean;
  /** Couleur du cadre */
  frameColor?: string;
  /** Échelle de base */
  scale?: number;
}

/**
 * Écran de surveillance avec cadre noir et effet glow
 * Style rétro CRT avec bords arrondis
 */
export default function ScreenMonitor({
  position,
  rotation = [0, 0, 0],
  size = [1.5, 1],
  imageUrl,
  label,
  onHover,
  onClick,
  emitLight = true,
  frameColor = '#0a0a0a',
  scale = 1,
}: ScreenMonitorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [currentScale, setCurrentScale] = useState(scale);
  
  // Chargement de la texture (avec fallback sécurisé)
  const texture = useSafeTexture(imageUrl);
  
  // Glow pulse animation
  const glowIntensity = useRef(0.5);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Animation de hover smooth
    const targetScale = hovered ? scale * 1.1 : scale;
    setCurrentScale(prev => prev + (targetScale - prev) * 0.1);
    
    groupRef.current.scale.setScalar(currentScale);
    
    // Pulse subtle du glow
    if (emitLight && screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      glowIntensity.current = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      material.emissiveIntensity = glowIntensity.current;
    }
  });
  
  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };
  
  const handlePointerOut = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'default';
  };
  
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClick?.();
  };
  
  // Matériau pour l'écran avec effet CRT
  const screenMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: '#ffffff',
      emissive: emitLight ? '#224422' : '#000000',
      emissiveIntensity: emitLight ? 0.3 : 0,
      roughness: 0.2,
      metalness: 0.1,
    });
  }, [texture, emitLight]);
  
  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
    >
      {/* Cadre de l'écran (plus profond que l'écran) */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[size[0] + 0.1, size[1] + 0.1, 0.08]} />
        <meshStandardMaterial 
          color={frameColor}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* Écran avec texture */}
      <mesh
        ref={screenRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <planeGeometry args={[size[0], size[1]]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>
      
      {/* Ligne de scan (effet CRT subtil) */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.1}
          blending={THREE.MultiplyBlending}
        >
          <primitive 
            object={new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')} 
            attach="map" 
          />
        </meshBasicMaterial>
      </mesh>
      
      {/* Label */}
      {label && (
        <mesh position={[0, -size[1]/2 - 0.15, 0]}>
          <planeGeometry args={[size[0], 0.15]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      )}
      
      {/* LED indicateur */}
      <mesh position={[size[0]/2 - 0.08, -size[1]/2 + 0.08, 0.02]}>
        <circleGeometry args={[0.02, 8]} />
        <meshBasicMaterial 
          color={hovered ? '#00ff00' : '#ff0000'}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
