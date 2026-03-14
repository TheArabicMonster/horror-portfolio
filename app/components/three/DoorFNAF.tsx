'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MediaType } from '../../lib/uploadthing';

/**
 * @file DoorFNAF.tsx
 * @description Porte industrielle style FNAF avec rayures warning jaunes/noires
 * @author Agent - Three.js Environment
 */

export interface DoorFNAFProps {
  /** Position [x, y, z] */
  position: [number, number, number];
  /** Rotation [x, y, z] - default [0, 0, 0] (facing Z+) */
  rotation?: [number, number, number];
  /** Type de contenu */
  type: MediaType;
  /** Label affiché au-dessus */
  label: string;
  /** Couleur des rayures warning */
  stripeColor: string;
  /** Couleur du bouton */
  buttonColor: string;
  /** État d'ouverture */
  isOpening: boolean;
  /** Callback quand l'ouverture est complète */
  onOpenComplete: () => void;
  /** Callback au clic */
  onClick: () => void;
  /** Taille du label (défaut: 28px) */
  labelSize?: string;
}

// ============================================================================
// TEXTURES PROCÉDURALES
// ============================================================================

/**
 * Crée une texture de rayures diagonales jaunes/noires style FNAF
 */
function createHazardStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Fond noir
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 512, 512);

  // Rayures jaunes diagonales
  ctx.fillStyle = '#ffcc00';
  const stripeWidth = 64;
  const spacing = 128;

  for (let i = -512; i < 1024; i += spacing) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + stripeWidth, 0);
    ctx.lineTo(i + stripeWidth + 512, 512);
    ctx.lineTo(i + 512, 512);
    ctx.closePath();
    ctx.fill();
  }

  // Ajouter du bruit/grunge
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // Rayures d'usure
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, Math.random() * 512);
    ctx.lineTo(Math.random() * 512, Math.random() * 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Crée une texture métal grunge avec bruit, rayures et rouille
 */
function createMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base métal gris foncé
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(0, 0, 512, 512);

  // Bruit de base
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // Rayures verticales (usure)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 10, 512);
    ctx.stroke();
  }

  // Rayures horizontales
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  for (let i = 0; i < 50; i++) {
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Taches de rouille
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 10 + Math.random() * 30;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(139, 69, 19, 0.6)');
    gradient.addColorStop(0.5, 'rgba(160, 82, 45, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Taches d'huile/saleté
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 5 + Math.random() * 15;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================

export default function DoorFNAF({
  position,
  rotation = [0, 0, 0],
  type,
  label,
  stripeColor,
  buttonColor,
  isOpening,
  onOpenComplete,
  onClick,
  labelSize = '28px',
}: DoorFNAFProps) {
  const groupRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Group>(null);
  const buttonLightRef = useRef<THREE.PointLight>(null);
  const [hovered, setHovered] = useState(false);
  const [openProgress, setOpenProgress] = useState(0);

  // Textures procédurales (mémorisées)
  const hazardTexture = useMemo(() => createHazardStripeTexture(), []);
  const metalTexture = useMemo(() => createMetalTexture(), []);

  // Teintes dérivées du stripeColor
  // Mélange avec gris foncé pour préserver la teinte sans saturation excessive
  const doorBodyColor = useMemo(() => {
    const base = new THREE.Color('#3a3a3a');
    return base.lerp(new THREE.Color(stripeColor), 0.45);
  }, [stripeColor]);

  const frameColor = useMemo(() => {
    const base = new THREE.Color('#1a1a1a');
    return base.lerp(new THREE.Color(stripeColor), 0.25);
  }, [stripeColor]);

  // Dimensions
  const doorWidth = 2;
  const doorHeight = 3;
  const doorDepth = 0.15;
  const frameThickness = 0.2;

  // Animation d'ouverture avec easing lourd
  // Utiliser une ref pour éviter les redémarrages d'animation
  const animationStartedRef = useRef(false);
  
  useEffect(() => {
    if (isOpening && !animationStartedRef.current) {
      animationStartedRef.current = true;
      const startTime = Date.now();
      const duration = 2000; // 2 secondes

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing lourd (easeInOutCubic)
        const eased = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        setOpenProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onOpenComplete();
        }
      };

      animate();
    }
    
    // Reset quand isOpening redevient false
    if (!isOpening) {
      animationStartedRef.current = false;
      setOpenProgress(0);
    }
  }, [isOpening, onOpenComplete]);

  // Animation pulsante du bouton
  useEffect(() => {
    if (!buttonLightRef.current) return;

    let animationId: number;
    const animate = () => {
      if (buttonLightRef.current) {
        const time = Date.now() * 0.003;
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;
        const hoverBoost = hovered ? 1.5 : 1;
        buttonLightRef.current.intensity = pulse * hoverBoost;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [hovered]);

  // Position Y de la porte (monte quand elle s'ouvre)
  const doorY = openProgress * (doorHeight + 0.5);

  // Gestionnaires d'interactions
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
    onClick();
  };

  return (
    // Groupe principal avec position et rotation configurables
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* ================================================================ */}
      {/* CADRE FIXE */}
      {/* ================================================================ */}
      
      {/* Haut du cadre */}
      <mesh position={[0, doorHeight + frameThickness / 2, 0]}>
        <boxGeometry args={[doorWidth + frameThickness * 2, frameThickness, doorDepth + 0.05]} />
        <meshStandardMaterial 
          color={frameColor}
          metalness={0.8}
          roughness={0.6}
          map={metalTexture}
        />
      </mesh>

      {/* Bas du cadre */}
      <mesh position={[0, -frameThickness / 2, 0]}>
        <boxGeometry args={[doorWidth + frameThickness * 2, frameThickness, doorDepth + 0.05]} />
        <meshStandardMaterial 
          color={frameColor}
          metalness={0.8}
          roughness={0.6}
          map={metalTexture}
        />
      </mesh>

      {/* Gauche du cadre */}
      <mesh position={[-(doorWidth / 2 + frameThickness / 2), doorHeight / 2, 0]}>
        <boxGeometry args={[frameThickness, doorHeight, doorDepth + 0.05]} />
        <meshStandardMaterial 
          color={frameColor}
          metalness={0.8}
          roughness={0.6}
          map={metalTexture}
        />
      </mesh>

      {/* Droite du cadre */}
      <mesh position={[doorWidth / 2 + frameThickness / 2, doorHeight / 2, 0]}>
        <boxGeometry args={[frameThickness, doorHeight, doorDepth + 0.05]} />
        <meshStandardMaterial 
          color={frameColor}
          metalness={0.8}
          roughness={0.6}
          map={metalTexture}
        />
      </mesh>

      {/* ================================================================ */}
      {/* PORTE MOBILE (monte quand isOpening) */}
      {/* ================================================================ */}
      <group ref={doorRef} position={[0, doorY, 0]}>
        {/* Porte principale - partie métal centrale */}
        <mesh position={[0, doorHeight / 2, 0]}>
          <boxGeometry args={[doorWidth, doorHeight * 0.6, doorDepth]} />
          <meshStandardMaterial
            color={doorBodyColor}
            map={metalTexture}
            metalness={0.7}
            roughness={0.5}
          />
        </mesh>

        {/* Bande haute avec rayures warning */}
        <mesh position={[0, doorHeight - 0.3, 0]}>
          <boxGeometry args={[doorWidth, 0.6, doorDepth + 0.01]} />
          <meshStandardMaterial 
            map={hazardTexture}
            color={stripeColor}
            metalness={0.5}
            roughness={0.7}
          />
        </mesh>

        {/* Bande basse avec rayures warning */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[doorWidth, 0.6, doorDepth + 0.01]} />
          <meshStandardMaterial 
            map={hazardTexture}
            color={stripeColor}
            metalness={0.5}
            roughness={0.7}
          />
        </mesh>

        {/* Lignes verticales décoratives */}
        <mesh position={[-doorWidth * 0.25, doorHeight / 2, doorDepth / 2 + 0.01]}>
          <boxGeometry args={[0.08, doorHeight * 0.5, 0.02]} />
          <meshStandardMaterial 
            color={stripeColor}
            emissive={stripeColor}
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[doorWidth * 0.25, doorHeight / 2, doorDepth / 2 + 0.01]}>
          <boxGeometry args={[0.08, doorHeight * 0.5, 0.02]} />
          <meshStandardMaterial 
            color={stripeColor}
            emissive={stripeColor}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Boulons aux coins */}
        {[
          [-doorWidth / 2 + 0.15, 0.15],
          [doorWidth / 2 - 0.15, 0.15],
          [-doorWidth / 2 + 0.15, doorHeight - 0.15],
          [doorWidth / 2 - 0.15, doorHeight - 0.15],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, doorDepth / 2 + 0.02]}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 8]} />
            <meshStandardMaterial 
              color="#2a2a2a" 
              metalness={0.9} 
              roughness={0.3}
            />
          </mesh>
        ))}

        {/* Glow de la porte quand hover */}
        {hovered && (
          <mesh position={[0, doorHeight / 2, doorDepth / 2 + 0.03]}>
            <planeGeometry args={[doorWidth - 0.1, doorHeight - 0.1]} />
            <meshBasicMaterial 
              color={buttonColor}
              transparent
              opacity={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>

      {/* ================================================================ */}
      {/* BOUTON À DROITE */}
      {/* ================================================================ */}
      <group position={[doorWidth / 2 + frameThickness + 0.35, doorHeight / 2, 0]}>
        {/* Boîtier noir */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.25, 0.4, 0.1]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            metalness={0.5} 
            roughness={0.8}
          />
        </mesh>

        {/* Bouton rond lumineux */}
        <mesh position={[0, 0.05, 0.06]}>
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial 
            color={buttonColor}
            emissive={buttonColor}
            emissiveIntensity={hovered ? 1 : 0.5}
          />
        </mesh>

        {/* Texte "OPEN" sur le boîtier */}
        <Html position={[0, -0.1, 0.06]} center transform>
          <div
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '10px',
              color: hovered ? '#ffffff' : '#888888',
              letterSpacing: '1px',
              pointerEvents: 'none',
              textShadow: hovered ? `0 0 5px ${buttonColor}` : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            OPEN
          </div>
        </Html>

        {/* Lumière pointLight du bouton */}
        <pointLight
          ref={buttonLightRef}
          position={[0, 0.05, 0.2]}
          color={buttonColor}
          intensity={hovered ? 1.5 : 0.7}
          distance={3}
          decay={2}
        />
      </group>

      {/* ================================================================ */}
      {/* HITBOX INVISIBLE POUR CLIC */}
      {/* ================================================================ */}
      <mesh
        position={[0, doorHeight / 2, 0.2]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[doorWidth + 0.5, doorHeight + 0.3, 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* ================================================================ */}
      {/* LABEL HTML AU-DESSUS */}
      {/* ================================================================ */}
      <Html position={[0, doorHeight + 0.5, 0]} center>
        <div
          onClick={handleClick}
          style={{
            fontFamily: 'VT323, monospace',
            fontSize: labelSize,
            color: hovered ? '#ffffff' : buttonColor,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: hovered ? '10px 18px' : '8px 14px',
            border: `2px solid ${buttonColor}`,
            borderRadius: '2px',
            boxShadow: hovered 
              ? `0 0 20px ${buttonColor}, 0 0 40px ${buttonColor}66, inset 0 0 10px ${buttonColor}33`
              : `0 0 10px ${buttonColor}66`,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.2s ease',
            textShadow: hovered ? `0 0 10px ${buttonColor}` : 'none',
            letterSpacing: hovered ? '3px' : '2px',
            textTransform: 'uppercase',
            pointerEvents: 'auto',
          }}
        >
          {hovered ? `>> ${label} <<` : label}
        </div>
      </Html>

      {/* Ligne indicateur sous le label */}
      <mesh position={[0, doorHeight + 0.35, 0]}>
        <boxGeometry args={[doorWidth * 0.5, 0.03, 0.01]} />
        <meshBasicMaterial 
          color={buttonColor}
          transparent
          opacity={hovered ? 1 : 0.6}
        />
      </mesh>

      {/* ================================================================ */}
      {/* GLOW AU SOL QUAND HOVER */}
      {/* ================================================================ */}
      {hovered && (
        <>
          <mesh position={[0, 0.02, doorWidth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1, 32]} />
            <meshBasicMaterial 
              color={buttonColor}
              transparent 
              opacity={0.15}
            />
          </mesh>
          {/* Anneau extérieur */}
          <mesh position={[0, 0.01, doorWidth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.2, 32]} />
            <meshBasicMaterial 
              color={buttonColor}
              transparent 
              opacity={0.08}
            />
          </mesh>
        </>
      )}

      {/* Lumière ambiante supplémentaire */}
      <pointLight
        position={[0, doorHeight / 2, 2]}
        color={buttonColor}
        intensity={hovered ? 0.5 : 0.1}
        distance={5}
        decay={2}
      />
    </group>
  );
}
