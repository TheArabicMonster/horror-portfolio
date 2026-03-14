'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useOptionalAudioContext } from '@/app/context/AudioContext';
import { useAppContext } from '@/app/context/AppContext';
import useSafeTexture from '../../hooks/useSafeTexture';
import CameraController from './CameraController';
import { getRandomMedia, Media, MediaType } from '../../lib/uploadthing';
import DoorFNAF from './DoorFNAF';
import { useDoorSound } from '@/app/hooks/useDoorSound';

export interface SecurityRoomV2Props {
  onPortalClick: (type: MediaType) => void;
  onScreenHover?: (screen: string | null) => void;
  onGlitchStart?: (type: MediaType) => void;
  debugMode?: boolean;
}

// ==================== COMPOSANTS INTERNES ====================

interface RoomProps {
  width?: number;
  height?: number;
  depth?: number;
}

function Room({ width = 10, height = 6, depth = 10 }: RoomProps) {
  const halfW = width / 2;
  const halfH = height / 2;
  const halfD = depth / 2;

  const materials = useMemo(() => ({
    floor: new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }),
    ceiling: new THREE.MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.8 }),
    wall: new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.7 }),
  }), []);

  return (
    <group>
      {/* Sol */}
      <mesh position={[0, -halfH, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floor}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      {/* Plafond */}
      <mesh position={[0, halfH, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.ceiling}>
        <planeGeometry args={[width, depth]} />
      </mesh>
      {/* Mur Gauche */}
      <mesh position={[-halfW, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={materials.wall}>
        <planeGeometry args={[depth, height]} />
      </mesh>
      {/* Mur Droite */}
      <mesh position={[halfW, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={materials.wall}>
        <planeGeometry args={[depth, height]} />
      </mesh>
      {/* Mur Fond */}
      <mesh position={[0, 0, -halfD]} material={materials.wall}>
        <planeGeometry args={[width, height]} />
      </mesh>
      {/* Mur Avant */}
      <mesh position={[0, 0, halfD]} rotation={[0, Math.PI, 0]} material={materials.wall}>
        <planeGeometry args={[width, height]} />
      </mesh>
    </group>
  );
}

// Néon clignotant
function FlickeringNeon({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null);
  const [intensity, setIntensity] = useState(2.5);

  useFrame((state) => {
    if (state.clock.elapsedTime % 0.1 < 0.05) {
      setIntensity(2.5 + Math.random() * 1.5);
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshBasicMaterial color="#e0e8ff" />
      </mesh>
      <pointLight ref={lightRef} color="#e0e8ff" intensity={intensity * 3} distance={10} decay={2} />
    </group>
  );
}

// Écran de surveillance individuel
interface ScreenProps {
  position: [number, number, number];
  label: string;
  onHover?: (label: string | null) => void;
}

function SurveillanceScreen({ position, label, onHover }: ScreenProps) {
  const [hovered, setHovered] = useState(false);
  // Utiliser useMemo avec une fonction qui ne s'exécute qu'une seule fois
  const media = useMemo(() => {
    try {
      return getRandomMedia();
    } catch (err) {
      console.error('[SurveillanceScreen] Error getting random media:', err);
      // Retourner un média par défaut en cas d'erreur
      return {
        id: 'fallback',
        url: '',
        type: 'photos' as MediaType,
        title: 'Fallback'
      };
    }
  }, []);
  const texture = useSafeTexture(media?.url);
  const audio = useOptionalAudioContext();
  const { openMedia } = useAppContext();

  const handlePointerOver = (e: any) => {
    e.stopPropagation?.();
    setHovered(true);
    onHover?.(label);
    document.body.style.cursor = 'pointer';
    audio?.playHoverBeep?.();
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation?.();
    setHovered(false);
    onHover?.(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e: any) => {
    e.stopPropagation?.();
    console.log(`[Screen] Clicked: ${label}`, media);
    console.log(`[Screen] Calling openMedia with:`, { mediaId: media.id, title: media.title });
    // Ouvrir le viewer avec ce média
    openMedia(media, 0, [media]);
    audio?.playBeep?.();
  };

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* Cadre */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[1.7, 1.1, 0.08]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Écran */}
      <mesh onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <planeGeometry args={[1.6, 1]} />
        <meshStandardMaterial 
          map={texture} 
          emissive={hovered ? '#223322' : '#112211'}
          emissiveIntensity={hovered ? 1.0 : 0.5}
        />
      </mesh>
      {/* Label */}
      <Html position={[0, -0.7, 0]} center>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: hovered ? '#00ff41' : '#666666', 
          fontSize: '18px',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// Porte vers galerie
interface PortalProps {
  position: [number, number, number];
  type: MediaType;
  label: string;
  color: string;
  onClick: (type: MediaType) => void;
}

function PortalDoor({ position, type, label, color, onClick }: PortalProps) {
  const [hovered, setHovered] = useState(false);
  const audio = useOptionalAudioContext();

  const handleClick = () => {
    audio?.playDoorCreak?.();
    onClick(type);
  };

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Lumière hover existante */}
      <pointLight position={[0, 1.8, 0.5]} color="#ff4400" intensity={hovered ? 2 : 0} distance={4} />
      
      {/* NOUVEAU: Lumière clignotante au-dessus de la porte */}
      <pointLight 
        position={[0, 2.2, 0]} 
        color={color} 
        intensity={hovered ? 2 : 0.3}
        distance={3}
        decay={2}
      />
      
      {/* NOUVEAU: Cercle lumineux au sol devant la porte */}
      {hovered && (
        <mesh position={[0, -1.9, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Cadre */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[1.6, 2.4, 0.15]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} metalness={0.8} />
      </mesh>
      
      {/* Portail lumineux */}
      <mesh 
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        onClick={handleClick}
      >
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={hovered ? 0.8 : 0.4}
          transparent 
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Label */}
      <Html position={[0, 1.5, 0.1]} center>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: hovered ? '#ffffff' : color, 
          fontSize: '32px',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// ==================== GIF ÉCRAN BUREAU ====================

const DESK_GIF_URLS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2dDlrY2RtN3gwMzh0NTZnbjhkMnMydDVvOXJhajc0dHZvcXd5dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/o1X5q5RhvcHFK3fXES/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2dDlrY2RtN3gwMzh0NTZnbjhkMnMydDVvOXJhajc0dHZvcXd5dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/HXBuDfbSZKrnglCmZv/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2dDlrY2RtN3gwMzh0NTZnbjhkMnMydDVvOXJhajc0dHZvcXd5dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/sCNZBmy5DDsZeb0evL/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2dDlrY2RtN3gwMzh0NTZnbjhkMnMydDVvOXJhajc0dHZvcXd5dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qxpBvmlwD1wAR0EUx5/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2dDlrY2RtN3gwMzh0NTZnbjhkMnMydDVvOXJhajc0dHZvcXd5dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7NwZJANS7Foi3SRAeO/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDh2dDlrY2RtN3gwMzh0NTZnbjhkMnMydDVvOXJhajc0dHZvcXd5dSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OBSz5O065WULidqWIz/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y3Q3ZmprbTI5bG8xdzJiMm1vZnk2aWQxcW0yZHlnMWNyYXY1dXhvbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3BKJ5ehjClcC4/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cWZkMG5rY3kyajV1NWd1Zm0yeWZndnJucnlkYndkdjd4bWcwbG9zcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TPmPW6VBIBVNCvQQTj/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dHYyZ3RmcTBkM2hlaXR2a3k5ZzU0bjFlbHdkb2ZkMmsxeDRodTgweiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/5L0OlgoZ4swepytsDx/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MXFudDJxNHZxYTRldXI0Ynk1eTU0cXo2bWJtOHN5bWRsNTB5NDJnMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7XkhpYfnkYdQ5hCD5H/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MXFudDJxNHZxYTRldXI0Ynk1eTU0cXo2bWJtOHN5bWRsNTB5NDJnMCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/IsaozcCGAEREY/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MWhlb3M5eHJlcGtudTh4NmYzazR0dHQ2YWd3ZmM2dnc3endsZW1yaSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/D5sjRRD0Qx56HfptZ8/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MWhlb3M5eHJlcGtudTh4NmYzazR0dHQ2YWd3ZmM2dnc3endsZW1yaSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/BeeQTsRFu4PZyyoYqc/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Y2tmN3oyZzZwMWx3MXdzNHdvcHF5bjZhcmkxdW1lcTk5OXgyOGNyMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/VdAco13QOvG0rcP6Fc/giphy.gif",
];

function DeskScreenVideo({ videoUrl }: { videoUrl: string }) {
  const texture = useVideoTexture(videoUrl, { loop: true, muted: true, start: true });
  return (
    <mesh position={[0, 0, 0.045]}>
      <planeGeometry args={[1.15, 0.65]} />
      <meshStandardMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function DeskScreenGif() {
  const videoUrl = useMemo(() => {
    const gifUrl = DESK_GIF_URLS[Math.floor(Math.random() * DESK_GIF_URLS.length)];
    return gifUrl.replace('giphy.gif', 'giphy.mp4');
  }, []);

  // Groupe centré à Y=0.85 (desk group space) → monitor bottom à Y=0.475, desk top à Y=0.075
  // Coords locales (relative au groupe) : monitor bottom = -0.375, desk top = -0.775
  return (
    <group position={[0, 0.85, -0.8]}>
      {/* Corps du moniteur */}
      <mesh>
        <boxGeometry args={[1.25, 0.75, 0.08]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
      {/* Écran vidéo */}
      <DeskScreenVideo videoUrl={videoUrl} />
      {/* Col du pied — relie le bas du moniteur au bureau */}
      <mesh position={[0, -0.575, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Base du pied — repose sur le plateau du bureau */}
      <mesh position={[0, -0.75, 0.05]}>
        <boxGeometry args={[0.45, 0.05, 0.28]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>
    </group>
  );
}

// Écran principal
function MainScreen({ position }: { position: [number, number, number] }) {
  const media = useMemo(() => {
    try {
      return getRandomMedia();
    } catch (err) {
      console.error('[MainScreen] Error getting random media:', err);
      return {
        id: 'fallback',
        url: '',
        type: 'photos' as MediaType,
        title: 'Fallback'
      };
    }
  }, []);
  const texture = useSafeTexture(media?.url);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} position={[0, 0, 1]} color="#4488ff" intensity={1} distance={6} decay={2} />
      {/* Cadre */}
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[4.2, 2.7, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.5} />
      </mesh>
      {/* Écran */}
      <mesh>
        <planeGeometry args={[4, 2.5]} />
        <meshStandardMaterial map={texture} emissive="#112244" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================

export default function SecurityRoomV2({ 
  onPortalClick,
  onScreenHover,
  onGlitchStart,
  debugMode = false,
}: SecurityRoomV2Props) {
  console.log("[SecurityRoomV2] Render started");
  
  const { camera } = useThree();
  const glitchTriggeredRef = useRef(false);
  const [openingDoor, setOpeningDoor] = useState<MediaType | null>(null);
  
  // État pour l'animation caméra
  const [cameraAnim, setCameraAnim] = useState<{
    active: boolean;
    targetDoor: { position: [number, number, number]; type: MediaType } | null;
    startTime: number;
    startRotation: THREE.Quaternion | null;
    startPosition: THREE.Vector3 | null;
  }>({ active: false, targetDoor: null, startTime: 0, startRotation: null, startPosition: null });
  
  const { playDoorOpen } = useDoorSound();

  useEffect(() => {
    console.log("[SecurityRoomV2] Mounted");
  }, []);

  const handlePortalClick = useCallback((type: MediaType) => {
    if (openingDoor || cameraAnim.active) return; // Déjà en cours
    
    console.log('[Animation] Started, door:', type);
    
    // Positions des portes
    const doorPositions: Record<MediaType, [number, number, number]> = {
      photos: [4.5, -3, -3.5],
      gif: [4.5, -3, 0],
      videos: [4.5, -3, 3.5],
    };
    
    glitchTriggeredRef.current = false;
    setOpeningDoor(type);
    setCameraAnim({
      active: true,
      targetDoor: { position: doorPositions[type], type },
      startTime: Date.now(),
      startRotation: camera.quaternion.clone(),
      startPosition: camera.position.clone(),
    });
    playDoorOpen();
  }, [openingDoor, cameraAnim.active, playDoorOpen]);

  // Initialisation de la caméra - ne pas reset pendant l'animation
  useEffect(() => {
    if (!cameraAnim.active) {
      camera.position.set(0, -1.6, 3.5);
      camera.lookAt(0, -2.0, 0);
      (camera as THREE.PerspectiveCamera).fov = 75;
      (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  }, [camera, cameraAnim.active]);

  // Animation caméra vers la porte
  useFrame((state) => {
    if (!cameraAnim.active || !cameraAnim.targetDoor || !cameraAnim.startRotation || !cameraAnim.startPosition) return;

    const elapsed = (Date.now() - cameraAnim.startTime) / 1000;
    const duration = 2.2;

    if (elapsed >= duration) {
      const targetType = cameraAnim.targetDoor!.type;
      if (!glitchTriggeredRef.current) {
        onGlitchStart?.(targetType);
        glitchTriggeredRef.current = true;
      }
      onPortalClick(targetType);
      setCameraAnim(prev => ({ ...prev, active: false }));
      return;
    }

    const startPos = cameraAnim.startPosition;
    const targetPos = cameraAnim.targetDoor.position;
    const finalPos = new THREE.Vector3(targetPos[0] - 0.5, targetPos[1] + 1.6, targetPos[2]);

    // Bézier cubique — 2 points de contrôle pour une approche face-à-face
    // P1 : avance en X tout en commençant à s'aligner sur le Z de la porte
    const p1 = new THREE.Vector3(
      startPos.x + 2.0,
      startPos.y,
      startPos.z + (finalPos.z - startPos.z) * 0.5
    );
    // P2 : directement devant la porte (même Z), garantit l'approche en ligne droite finale
    const p2 = new THREE.Vector3(
      finalPos.x - 1.8,
      finalPos.y,
      finalPos.z
    );

    // Déclencher le GlitchLoader dès que la caméra entre dans la porte (85% de l'animation)
    if (!glitchTriggeredRef.current && elapsed / duration >= 0.85) {
      glitchTriggeredRef.current = true;
      onGlitchStart?.(cameraAnim.targetDoor.type);
    }

    // Easing quintic ease-in-out : départ et arrivée très doux
    const t = Math.min(elapsed / duration, 1);
    const eased = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;

    // Calcul du point sur la Bézier cubique
    const u = 1 - eased;
    const pos = new THREE.Vector3(
      u*u*u*startPos.x + 3*u*u*eased*p1.x + 3*u*eased*eased*p2.x + eased*eased*eased*finalPos.x,
      u*u*u*startPos.y + 3*u*u*eased*p1.y + 3*u*eased*eased*p2.y + eased*eased*eased*finalPos.y,
      u*u*u*startPos.z + 3*u*u*eased*p1.z + 3*u*eased*eased*p2.z + eased*eased*eased*finalPos.z,
    );
    state.camera.position.copy(pos);

    // Rotation : suit la porte en continu sur toute la durée
    const lookTarget = new THREE.Vector3(targetPos[0], targetPos[1] + 1.5, targetPos[2]);
    const targetQuaternion = new THREE.Quaternion();
    const rotationMatrix = new THREE.Matrix4().lookAt(state.camera.position, lookTarget, new THREE.Vector3(0, 1, 0));
    targetQuaternion.setFromRotationMatrix(rotationMatrix);
    state.camera.quaternion.slerpQuaternions(cameraAnim.startRotation, targetQuaternion, eased);
  });

  // Compter les écrans
  const screens = [
    { pos: [-4.9, 1.0, -0.8], label: "CAM-01" },
    { pos: [-4.9, 1.0, 0.8], label: "CAM-02" },
    { pos: [-4.9, -0.3, -0.8], label: "CAM-03" },
    { pos: [-4.9, -0.3, 0.8], label: "CAM-04" },
  ];

  console.log("[SecurityRoomV2] Rendering scene elements:", screens.length, "screens");

  return (
    <>
      {/* Contrôles Caméra */}
      <CameraController
        mode="orbit"
        initialPosition={[0, -1.6, 2.5]}
        target={[0, -1, 0]}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.72}
        minAzimuthAngle={-Math.PI / 1.5}
        maxAzimuthAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
        enabled={!cameraAnim.active}
      />
      
      {/* Lumière ambiante */}
      <ambientLight intensity={0.4} color="#2a2a2a" />
      
      {/* Lumière directionnelle */}
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      
      {/* Pièce */}
      <Room width={10} height={6} depth={10} />
      
      {/* Néons plafond - collés au plafond (Y = 2.95, juste sous le plafond à Y=3) */}
      <FlickeringNeon position={[-2.5, 2.95, 0]} />  {/* Gauche */}
      <FlickeringNeon position={[2.5, 2.95, 0]} />   {/* Droite */}
      
      {/* Écrans de surveillance (mur gauche) - Grid 2x2 compact */}
      <SurveillanceScreen position={[-4.9, 1.0, -0.8]} label="CAM-01" onHover={onScreenHover} />
      <SurveillanceScreen position={[-4.9, 1.0, 0.8]} label="CAM-02" onHover={onScreenHover} />
      <SurveillanceScreen position={[-4.9, -0.3, -0.8]} label="CAM-03" onHover={onScreenHover} />
      <SurveillanceScreen position={[-4.9, -0.3, 0.8]} label="CAM-04" onHover={onScreenHover} />
      
      {/* Portes (mur droit) - Espacées pour éviter le chevauchement */}
      {/* Porte PHOTOS - Mur droit (X+), face vers le centre (X-) */}
      <DoorFNAF
        position={[4.5, -3, -3.5]}
        rotation={[0, -Math.PI / 2, 0]}
        type="photos"
        label="PHOTOS"
        stripeColor="#00aa33"
        buttonColor="#00ff55"
        isOpening={openingDoor === 'photos'}
        onOpenComplete={() => {}}
        onClick={() => handlePortalClick('photos')}
        labelSize="20px"
      />

      {/* Porte GIF - Mur droit (X+), face vers le centre (X-) */}
      <DoorFNAF
        position={[4.5, -3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        type="gif"
        label="GIF"
        stripeColor="#ff7700"
        buttonColor="#ffaa00"
        isOpening={openingDoor === 'gif'}
        onOpenComplete={() => {}}
        onClick={() => handlePortalClick('gif')}
        labelSize="20px"
      />

      {/* Porte VIDEOS - Mur droit (X+), face vers le centre (X-) */}
      <DoorFNAF
        position={[4.5, -3, 3.5]}
        rotation={[0, -Math.PI / 2, 0]}
        type="videos"
        label="VIDEOS"
        stripeColor="#cc1111"
        buttonColor="#ff3333"
        isOpening={openingDoor === 'videos'}
        onOpenComplete={() => {}}
        onClick={() => handlePortalClick('videos')}
        labelSize="20px"
      />
      
      {/* Éclairage portes */}
      <pointLight position={[3, 2.5, 0]} intensity={0.8} color="#ffffff" distance={8} />
      
      {/* Écran principal (mur fond) */}
      <MainScreen position={[0, 0.5, -4.9]} />
      
      {/* Bureau au centre de la pièce - ÉLOIGNÉ de la caméra */}
      <group position={[0, -2.2, 0]}>
        {/* Plateau bureau - PLUS GRAND */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 0.15, 2.5]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.8} />
        </mesh>
        {/* Pieds gauche */}
        <mesh position={[-1.5, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 2]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Pieds droite */}
        <mesh position={[1.5, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 2]} />
          <meshStandardMaterial color="#2a2a2a" />
        </mesh>
        {/* Écran sur le bureau */}
        <DeskScreenGif />
        {/* Clavier */}
        <mesh position={[0, 0.1, 0.3]}>
          <boxGeometry args={[1, 0.05, 0.4]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      
      {/* Debug */}
      {debugMode && (
        <>
          <axesHelper args={[5]} />
          <gridHelper args={[20, 20, 0xff0000, 0x444444]} />
        </>
      )}
    </>
  );
}
