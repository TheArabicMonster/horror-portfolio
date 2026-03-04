'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * @file Room.tsx
 * @description Pièce 3D style FNAF (box inversé)
 * @author Agent 3 - Three.js Environment
 */

export interface RoomProps {
  /** Largeur de la pièce */
  width?: number;
  /** Hauteur de la pièce */
  height?: number;
  /** Profondeur de la pièce */
  depth?: number;
  /** Couleur des murs */
  wallColor?: string;
  /** Couleur du sol */
  floorColor?: string;
  /** Couleur du plafond */
  ceilingColor?: string;
}

/**
 * Pièce box inversée pour la Security Room
 * Render from inside - on voit l'intérieur des faces
 */
export default function Room({
  width = 10,
  height = 6,
  depth = 10,
  wallColor = '#2a2a2a',
  floorColor = '#1a1a1a',
  ceilingColor = '#0a0a0a',
}: RoomProps) {
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  // Géométries mémoïsées pour performance
  const geometries = useMemo(() => ({
    floor: new THREE.PlaneGeometry(width, depth),
    ceiling: new THREE.PlaneGeometry(width, depth),
    wallLeft: new THREE.PlaneGeometry(depth, height),
    wallRight: new THREE.PlaneGeometry(depth, height),
    wallBack: new THREE.PlaneGeometry(width, height),
    wallFront: new THREE.PlaneGeometry(width, height),
  }), [width, height, depth]);

  // Matériaux mémoïsés
  const materials = useMemo(() => ({
    floor: new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.9,
      metalness: 0.1,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: ceilingColor,
      roughness: 0.8,
      metalness: 0.2,
    }),
    wall: new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.7,
      metalness: 0.3,
    }),
  }), [floorColor, ceilingColor, wallColor]);

  return (
    <group>
      {/* Sol - Moquette sombre */}
      <mesh 
        position={[0, -halfH, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={geometries.floor}
        material={materials.floor}
        receiveShadow
      />

      {/* Plafond avec grille néon */}
      <mesh 
        position={[0, halfH, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
        geometry={geometries.ceiling}
        material={materials.ceiling}
        receiveShadow
      />

      {/* Grille de plafond (détail visuel) */}
      <mesh position={[0, halfH - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width - 1, depth - 1]} />
        <meshBasicMaterial
          color="#1a1a1a"
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>

      {/* Mur Gauche */}
      <mesh 
        position={[-halfW, 0, 0]} 
        rotation={[0, Math.PI / 2, 0]}
        geometry={geometries.wallLeft}
        material={materials.wall}
        receiveShadow
      />

      {/* Mur Droite */}
      <mesh 
        position={[halfW, 0, 0]} 
        rotation={[0, -Math.PI / 2, 0]}
        geometry={geometries.wallRight}
        material={materials.wall}
        receiveShadow
      />

      {/* Mur Fond */}
      <mesh 
        position={[0, 0, -halfD]}
        geometry={geometries.wallBack}
        material={materials.wall}
        receiveShadow
      />

      {/* Mur Avant (derrière la caméra) */}
      <mesh 
        position={[0, 0, halfD]} 
        rotation={[0, Math.PI, 0]}
        geometry={geometries.wallFront}
        material={materials.wall}
        receiveShadow
      />

      {/* Câbles au sol (tubes fins) */}
      <mesh position={[-2, -halfH + 0.02, 1]} rotation={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3, 6]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      <mesh position={[1.5, -halfH + 0.02, -1]} rotation={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.5, 6]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Ventilation au plafond */}
      <mesh position={[0, halfH - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshStandardMaterial color="#0a0a0a" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
