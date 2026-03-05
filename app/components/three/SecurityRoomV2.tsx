'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useOptionalAudioContext } from '@/app/context/AudioContext';
import { useAppContext } from '@/app/context/AppContext';
import useSafeTexture from '../../hooks/useSafeTexture';
import CameraController from './CameraController';
import { getRandomMedia, Media, MediaType } from '../../lib/uploadthing';
import DoorFNAF from './DoorFNAF';
import { useDoorSound } from '@/app/hooks/useDoorSound';
import CameraZoomEffect from './CameraZoomEffect';

export interface SecurityRoomV2Props {
  onPortalClick: (type: MediaType) => void;
  onScreenHover?: (screen: string | null) => void;
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
  const [intensity, setIntensity] = useState(1);

  useFrame((state) => {
    if (state.clock.elapsedTime % 0.1 < 0.05) {
      setIntensity(0.8 + Math.random() * 0.4);
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2, 8]} />
        <meshBasicMaterial color="#e0e8ff" />
      </mesh>
      <pointLight ref={lightRef} color="#e0e8ff" intensity={intensity} distance={5} decay={2} />
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
        type: 'illustrations' as MediaType,
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
        type: 'illustrations' as MediaType,
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
  debugMode = false,
}: SecurityRoomV2Props) {
  console.log("[SecurityRoomV2] Render started");
  
  const { camera } = useThree();
  const [openingDoor, setOpeningDoor] = useState<string | null>(null);
  const [isZooming, setIsZooming] = useState(false);
  const { playDoorOpen } = useDoorSound();

  useEffect(() => {
    console.log("[SecurityRoomV2] Mounted");
  }, []);

  const handlePortalClick = useCallback((type: MediaType) => {
    if (openingDoor) return; // Déjà en cours
    
    setOpeningDoor(type);
    playDoorOpen();
    
    // Attendre fin animation porte (2s) puis zoom
    setTimeout(() => {
      setIsZooming(true);
      
      // Navigation après zoom (1.5s)
      setTimeout(() => {
        onPortalClick(type);
      }, 1500);
    }, 2000);
  }, [onPortalClick, openingDoor, playDoorOpen]);

  useEffect(() => {
    camera.position.set(0, 1.6, 4);
    camera.lookAt(0, 1, 0);
  }, [camera]);

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
        initialPosition={[0, 1.6, 4]}
        target={[0, 1, 0]}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 1.5}
        maxAzimuthAngle={Math.PI / 3}
        enableZoom={false}
        enablePan={false}
      />
      
      {/* Lumière ambiante */}
      <ambientLight intensity={0.5} color="#2a2a2a" />
      
      {/* Lumière directionnelle */}
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      
      {/* Pièce */}
      <Room width={10} height={6} depth={10} />
      
      {/* Néons */}
      <FlickeringNeon position={[0, 2.7, 0]} />
      <FlickeringNeon position={[0, 2.7, 3]} />
      
      {/* Écrans de surveillance (mur gauche) - Grid 2x2 compact */}
      <SurveillanceScreen position={[-4.9, 1.0, -0.8]} label="CAM-01" onHover={onScreenHover} />
      <SurveillanceScreen position={[-4.9, 1.0, 0.8]} label="CAM-02" onHover={onScreenHover} />
      <SurveillanceScreen position={[-4.9, -0.3, -0.8]} label="CAM-03" onHover={onScreenHover} />
      <SurveillanceScreen position={[-4.9, -0.3, 0.8]} label="CAM-04" onHover={onScreenHover} />
      
      {/* Portes (mur droit) - Espacées pour éviter le chevauchement */}
      {/* Porte ILLUSTRATIONS - Mur droit (X+), face vers le centre (X-) */}
      <DoorFNAF
        position={[4.5, 0, -3.5]}
        rotation={[0, -Math.PI / 2, 0]}
        type="illustrations"
        label="ILLUSTRATIONS"
        stripeColor="#ffcc00"
        buttonColor="#00ff41"
        isOpening={openingDoor === 'illustrations'}
        onOpenComplete={() => {}}
        onClick={() => handlePortalClick('illustrations')}
        labelSize="20px"
      />

      {/* Porte PHOTOS - Mur droit (X+), face vers le centre (X-) */}
      <DoorFNAF
        position={[4.5, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        type="photos"
        label="PHOTOS"
        stripeColor="#ffcc00"
        buttonColor="#ffaa00"
        isOpening={openingDoor === 'photos'}
        onOpenComplete={() => {}}
        onClick={() => handlePortalClick('photos')}
        labelSize="20px"
      />

      {/* Porte VIDEOS - Mur droit (X+), face vers le centre (X-) */}
      <DoorFNAF
        position={[4.5, 0, 3.5]}
        rotation={[0, -Math.PI / 2, 0]}
        type="videos"
        label="VIDEOS"
        stripeColor="#ffcc00"
        buttonColor="#ff3333"
        isOpening={openingDoor === 'videos'}
        onOpenComplete={() => {}}
        onClick={() => handlePortalClick('videos')}
        labelSize="20px"
      />
      
      {/* Éclairage portes */}
      <pointLight position={[3, 2.5, 0]} intensity={0.8} color="#ffffff" distance={8} />
      
      {isZooming && <CameraZoomEffect target={openingDoor} />}
      
      {/* Écran principal (mur fond) */}
      <MainScreen position={[0, 0.5, -4.9]} />
      
      {/* Bureau au centre de la pièce - ÉLOIGNÉ de la caméra */}
      <group position={[0, -0.8, 0]}>
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
        {/* Écran sur le bureau - PLUS GRAND */}
        <mesh position={[0, 0.5, -0.8]}>
          <boxGeometry args={[1.2, 0.7, 0.08]} />
          <meshStandardMaterial color="#224422" emissive="#112211" emissiveIntensity={0.4} />
        </mesh>
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
