'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
// import { Stars } from '@react-three/drei'; // Désactivé temporairement
import * as THREE from 'three';

// Composants de la scène
import Room from './Room';
import CeilingLights from './CeilingLights';
import SurveillanceScreens from './SurveillanceScreens';
import DoorPortals from './DoorPortals';
import MainScreen from './MainScreen';
import Desk from './Desk';
import CameraController from './CameraController';
import { type MediaType } from '@/app/lib/uploadthing';

/**
 * @file SecurityRoom.tsx
 * @description Scène 3D principale du Bureau de Surveillance style FNAF
 * @author Agent 3 - Three.js Environment
 * @modified Agent 7 - Ajout mode debug (wireframe, axes)
 */

export interface SecurityRoomProps {
  /** Callback quand un portail est cliqué */
  onPortalClick: (type: MediaType) => void;
  /** Callback quand un écran est survolé */
  onScreenHover?: (screen: string | null) => void;
  /** Mode debug: active wireframe et axes helper */
  debugMode?: boolean;
}

// Dimensions de la pièce
const ROOM_CONFIG = {
  width: 10,
  height: 6,
  depth: 10,
};

/**
 * Bureau de Surveillance complet style FNAF
 * Pièce 10x6x10 avec écrans, portails et néons
 * 
 * Structure:
 * - Room: Box inversé (murs, sol, plafond)
 * - CeilingLights: 2 néons clignotants
 * - SurveillanceScreens: 4 écrans mur gauche
 * - DoorPortals: 3 portes mur droit
 * - MainScreen: Grand écran fond
 * - Desk: Bureau avec petits écrans
 * - CameraController: Contrôles caméra
 */
export default function SecurityRoom({ 
  onPortalClick,
  onScreenHover,
  debugMode = false,
}: SecurityRoomProps) {
  const { camera, scene } = useThree();
  const [hoveredScreen, setHoveredScreen] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Position initiale de la caméra
  useEffect(() => {
    camera.position.set(0, 1.6, 4);
    camera.lookAt(0, 1, 0);
  }, [camera]);

  // Mode debug: wireframe sur tous les meshes
  useEffect(() => {
    if (!debugMode) {
      // Reset wireframe
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
          materials.forEach((mat) => {
            mat.wireframe = false;
          });
        }
      });
      return;
    }

    // Active wireframe
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) 
          ? child.material 
          : [child.material];
        materials.forEach((mat) => {
          mat.wireframe = true;
        });
      }
    });
  }, [debugMode, scene]);
  
  // Gestion du hover des écrans
  const handleScreenHover = useCallback((screen: string | null) => {
    setHoveredScreen(screen);
    onScreenHover?.(screen);
  }, [onScreenHover]);

  // Gestion du clic sur écran
  const handleScreenClick = useCallback((screenId: string) => {
    console.log(`[SecurityRoom] Screen clicked: ${screenId}`);
  }, []);
  
  return (
    <>
      {/* === CONTRÔLES DE CAMÉRA === */}
      <CameraController
        mode="orbit"
        initialPosition={[0, 1.6, 4]}
        target={[0, 1, 0]}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
      />
      
      {/* === LUMIÈRES === */}
      {/* Lumière ambiente très faible */}
      <ambientLight intensity={0.2} color="#1a1a1a" />
      
      {/* === PIÈCE (Box inversé) === */}
      <Room
        width={ROOM_CONFIG.width}
        height={ROOM_CONFIG.height}
        depth={ROOM_CONFIG.depth}
        wallColor="#2a2a2a"
        floorColor="#1a1a1a"
        ceilingColor="#0a0a0a"
      />
      
      {/* === ÉCLAIRAGE NÉON === */}
      <CeilingLights
        height={ROOM_CONFIG.height / 2 - 0.3}
        spacing={3}
        color="#e0e8ff"
        intensity={1.2}
        flickerRate={0.12}
        tubeLength={1.5}
      />
      
      {/* === BUREAU === */}
      <Desk position={[0, -0.8, 2]} />
      
      {/* === MUR GAUCHE - 4 écrans de surveillance === */}
      <SurveillanceScreens
        position={[-ROOM_CONFIG.width / 2 + 0.1, 0.5, 0]}
        onScreenClick={handleScreenClick}
        onScreenHover={handleScreenHover}
      />
      
      {/* === MUR DROITE - 3 Portails === */}
      <DoorPortals
        position={[ROOM_CONFIG.width / 2 - 0.1, 0, 0]}
        onPortalClick={onPortalClick}
      />
      
      {/* === MUR FOND - Grand écran principal === */}
      <MainScreen
        position={[0, 0.5, -ROOM_CONFIG.depth / 2 + 0.1]}
        width={4}
        height={2.5}
      />
      
      {/* === DÉTAILS DÉCORATIFS === */}
      {/* Lumière tamisée depuis la ventilation */}
      <pointLight
        position={[0, ROOM_CONFIG.height / 2 - 0.5, 0]}
        color="#1a1a1a"
        intensity={0.2}
        distance={3}
      />
      
      {/* Étoiles lointaines (visible à travers les portails) - DÉSACTIVÉ */}
      {/* <Stars radius={20} depth={50} count={100} factor={2} saturation={0} fade /> */}
      
      {/* Mode debug: Axes helper */}
      {debugMode && <axesHelper args={[5]} />}
      
      {/* Mode debug: Grid helper */}
      {debugMode && <gridHelper args={[20, 20, 0xff0000, 0x444444]} />}
    </>
  );
}
