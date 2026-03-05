'use client';

import { useState, useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  position: [number, number, number];
  type: 'illustrations' | 'photos' | 'videos';
  label: string;
  color: string;
  isOpening: boolean;
  onOpenComplete: () => void;
  onClick?: () => void;
}

export default function AnimatedMetalDoor({
  position,
  type,
  label,
  color,
  isOpening,
  onOpenComplete,
  onClick,
}: Props) {
  const [openProgress, setOpenProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    console.log(`[AnimatedMetalDoor ${type}] isOpening:`, isOpening);
    if (isOpening && openProgress < 1) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 2000, 1);
        setOpenProgress(progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onOpenComplete();
        }
      };
      animate();
    }
  }, [isOpening, onOpenComplete, openProgress, type]);

  // Animation de la lumière pulsante
  useEffect(() => {
    if (!lightRef.current) return;
    
    let animationId: number;
    const animate = () => {
      if (lightRef.current) {
        const time = Date.now() * 0.001;
        const baseIntensity = hovered ? 1.5 : 0.3;
        const pulse = Math.sin(time * 2) * 0.3 + 1;
        lightRef.current.intensity = baseIntensity * pulse;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [hovered]);

  const doorY = openProgress * 3;

  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = () => {
    onClick?.();
  };

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Hitbox invisible pour clic - zone cliquable plus grande */}
      <mesh
        position={[0, doorY + 1.5, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[2.2, 3.2, 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Contour glow quand hover */}
      {hovered && (
        <mesh position={[0, doorY + 1.5, 0]}>
          <boxGeometry args={[2.05, 3.05, 0.22]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Porte métal principale - plus grande */}
      <mesh position={[0, doorY + 1.5, 0]}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial 
          color="#3a3a3a" 
          metalness={0.7} 
          roughness={0.5}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>

      {/* Détail: cadre métallique */}
      <mesh position={[0, doorY + 1.5, -0.05]}>
        <boxGeometry args={[2.1, 3.1, 0.1]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.8} 
          roughness={0.4}
        />
      </mesh>

      {/* Barre lumineuse colorée en haut */}
      <mesh position={[0, doorY + 2.6, 0.12]}>
        <boxGeometry args={[1.8, 0.15, 0.05]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={hovered ? 1 : 0.7}
        />
      </mesh>

      {/* Barre lumineuse colorée en bas */}
      <mesh position={[0, doorY + 0.4, 0.12]}>
        <boxGeometry args={[1.8, 0.15, 0.05]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={hovered ? 1 : 0.7}
        />
      </mesh>

      {/* Lignes décoratives verticales */}
      <mesh position={[-0.7, doorY + 1.5, 0.11]}>
        <boxGeometry args={[0.05, 2.5, 0.02]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>
      <mesh position={[0.7, doorY + 1.5, 0.11]}>
        <boxGeometry args={[0.05, 2.5, 0.02]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
        />
      </mesh>

      {/* Lumière pointLight devant la porte */}
      <pointLight
        ref={lightRef}
        position={[0, 1.5, 2]}
        color={color}
        intensity={hovered ? 1.5 : 0.3}
        distance={6}
        decay={2}
      />

      {/* Lumière supplémentaire au-dessus */}
      <pointLight
        position={[0, 3, 1]}
        color={color}
        intensity={hovered ? 1 : 0.2}
        distance={4}
        decay={2}
      />

      {/* Label HTML avec style amélioré */}
      <Html position={[0, doorY + 1.5, 0.25]} center transform>
        <div
          onClick={handleClick}
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: hovered ? '28px' : '24px',
            color: hovered ? '#ffffff' : color,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: hovered ? '10px 20px' : '8px 16px',
            border: `2px solid ${color}`,
            borderRadius: '4px',
            boxShadow: hovered 
              ? `0 0 20px ${color}, 0 0 40px ${color}66, inset 0 0 10px ${color}33`
              : `0 0 10px ${color}66`,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s ease',
            textShadow: hovered ? `0 0 10px ${color}` : 'none',
            letterSpacing: hovered ? '2px' : '1px',
            pointerEvents: 'none', // Laisser passer les événements au mesh 3D
          }}
        >
          {hovered ? `>> ${label.toUpperCase()} <<` : label.toUpperCase()}
        </div>
      </Html>

      {/* Indicateur visuel au sol quand hover */}
      {hovered && (
        <mesh position={[0, 0, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.6, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}
