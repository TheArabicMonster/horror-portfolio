'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface SecurityRoomSimpleProps {
  onPortalClick: (type: 'illustrations' | 'photos' | 'videos') => void;
  onScreenHover?: (screen: string | null) => void;
  debugMode?: boolean;
}

/**
 * Version simplifiée de SecurityRoom pour debug
 */
export default function SecurityRoomSimple({ 
  onPortalClick,
  onScreenHover,
  debugMode = false,
}: SecurityRoomSimpleProps) {
  const { camera } = useThree();
  const boxRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    camera.position.set(0, 1.6, 4);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((state) => {
    if (boxRef.current) {
      boxRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      boxRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <>
      {/* Lumière ambiente */}
      <ambientLight intensity={0.5} />
      
      {/* Lumière directionnelle */}
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Cube central */}
      <mesh ref={boxRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial 
          color={debugMode ? "#ff0000" : "#00ff41"} 
          wireframe={debugMode}
        />
      </mesh>
      
      {/* 3 Portes simples */}
      {[
        { pos: [-3, 0, -2] as [number, number, number], color: '#00ff41', label: 'ILLUSTRATIONS', type: 'illustrations' as const },
        { pos: [-3, 0, 0] as [number, number, number], color: '#ffb000', label: 'PHOTOS', type: 'photos' as const },
        { pos: [-3, 0, 2] as [number, number, number], color: '#ff3333', label: 'VIDEOS', type: 'videos' as const },
      ].map((door, i) => (
        <group key={i} position={door.pos}>
          <mesh 
            onClick={() => onPortalClick(door.type)}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'default'}
          >
            <boxGeometry args={[0.5, 2, 1]} />
            <meshStandardMaterial color={door.color} />
          </mesh>
        </group>
      ))}
      
      {/* Écrans simples */}
      {[
        { pos: [3, 1, -1.5] as [number, number, number] },
        { pos: [3, 1, 1.5] as [number, number, number] },
        { pos: [3, -0.5, -1.5] as [number, number, number] },
        { pos: [3, -0.5, 1.5] as [number, number, number] },
      ].map((screen, i) => (
        <mesh key={i} position={screen.pos} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 1]} />
          <meshStandardMaterial color="#224422" emissive="#112211" />
        </mesh>
      ))}
    </>
  );
}
