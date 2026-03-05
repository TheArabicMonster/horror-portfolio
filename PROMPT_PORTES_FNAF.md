# 🚪 Prompt - Portes Style FNAF (Industrial Metal Doors)

> **Référence** : Portes de FNAF Security Office - lourdes, métal industriel, rayures jaunes/noires en haut/bas, aspect grunge.

---

## 🎯 Objectif

Remplacer les cadres colorés actuels par des **vraies portes industrielles** style FNAF :

### Caractéristiques FNAF
- **Rayures jaunes/noires** (hazard stripes) en haut et en bas
- **Texture métal grunge** - gris foncé, rouille, usure
- **Aspect lourd industriel** - épaisseur, boulons, joints
- **Panneau/bouton lumineux** à droite (vert/orange/rouge selon type)
- **Animation** : monte vers le haut quand on clique

---

## 🔴 Agent 1 : Créer DoorFNAF Component

**Nouveau fichier** : `app/components/three/DoorFNAF.tsx`

```tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface DoorFNAFProps {
  position: [number, number, number];
  type: 'illustrations' | 'photos' | 'videos';
  label: string;
  stripeColor: string; // '#ffcc00' pour jaune FNAF
  buttonColor: string; // '#00ff41', '#ffaa00', '#ff3333'
  isOpening: boolean;
  onOpenComplete: () => void;
  onClick: () => void;
}

// Texture procédurale rayures jaunes/noires
function createHazardStripeTexture(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  // Fond noir
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 256, 256);
  
  // Rayures jaunes diagonales
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  for (let i = -256; i < 512; i += 64) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 32, 0);
    ctx.lineTo(i + 32 + 128, 256);
    ctx.lineTo(i + 128, 256);
    ctx.closePath();
  }
  ctx.fill();
  
  // Bruit/grunge
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#333333';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  
  return canvas.toDataURL();
}

// Texture métal grunge
function createMetalTexture(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Base gris foncé
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, 512, 512);
  
  // Bruit métal
  for (let i = 0; i < 20000; i++) {
    const gray = 30 + Math.random() * 40;
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  
  // Rayures verticales usure
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512;
    const opacity = Math.random() * 0.3;
    ctx.strokeStyle = `rgba(0,0,0,${opacity})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  
  // Taches rouille
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 20 + Math.random() * 40;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, 'rgba(139, 69, 19, 0.6)');
    gradient.addColorStop(1, 'rgba(139, 69, 19, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas.toDataURL();
}

export default function DoorFNAF({
  position,
  type,
  label,
  stripeColor,
  buttonColor,
  isOpening,
  onOpenComplete,
  onClick,
}: DoorFNAFProps) {
  const [openProgress, setOpenProgress] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  
  // Animation ouverture
  useEffect(() => {
    if (isOpening && openProgress < 1) {
      const startTime = Date.now();
      const duration = 2000;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing heavy industriel
        const eased = 1 - Math.pow(1 - progress, 4);
        setOpenProgress(eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onOpenComplete();
        }
      };
      animate();
    }
  }, [isOpening, onOpenComplete, openProgress]);
  
  // Textures procédurales
  const textures = useMemo(() => {
    if (!mounted) return null;
    return {
      metal: createMetalTexture(),
      stripes: createHazardStripeTexture(),
    };
  }, [mounted]);
  
  const doorY = openProgress * 3.5;
  
  if (!textures) return null;
  
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* ===== CADRE DE PORTE (fixe) ===== */}
      {/* Haut */}
      <mesh position={[0, 3.3, 0]}>
        <boxGeometry args={[2.4, 0.4, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.9} />
      </mesh>
      {/* Bas */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[2.4, 0.4, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.9} />
      </mesh>
      {/* Gauche */}
      <mesh position={[-1.1, 1.5, 0]}>
        <boxGeometry args={[0.3, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.9} />
      </mesh>
      {/* Droite */}
      <mesh position={[1.1, 1.5, 0]}>
        <boxGeometry args={[0.3, 3.5, 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.9} />
      </mesh>
      
      {/* ===== PORTE MOBILE (monte) ===== */}
      <group position={[0, doorY, 0]}>
        {/* Panneau principal métal */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.9, 3.1, 0.15]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            metalness={0.7} 
            roughness={0.8}
            map={textures.metal}
          />
        </mesh>
        
        {/* Rayures jaunes/noires EN HAUT */}
        <mesh position={[0, 2.8, 0.08]}>
          <planeGeometry args={[1.9, 0.5]} />
          <meshBasicMaterial 
            map={textures.stripes}
            transparent
          />
        </mesh>
        
        {/* Rayures jaunes/noires EN BAS */}
        <mesh position={[0, 0.2, 0.08]}>
          <planeGeometry args={[1.9, 0.5]} />
          <meshBasicMaterial 
            map={textures.stripes}
            transparent
          />
        </mesh>
        
        {/* Lignes verticales décoratives */}
        {[-0.6, 0, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 0.08]}>
            <boxGeometry args={[0.05, 2.5, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.5} />
          </mesh>
        ))}
        
        {/* Boulons/coins */}
        {[
          [-0.85, 2.9], [0.85, 2.9],
          [-0.85, 0.1], [0.85, 0.1],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.1]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 8]} />
            <meshStandardMaterial color="#555" metalness={1} roughness={0.3} />
          </mesh>
        ))}
      </group>
      
      {/* ===== BOUTON/PANNEAU À DROITE (fixe) ===== */}
      <group position={[1.4, 1.5, 0.1]}>
        {/* Boîtier */}
        <mesh>
          <boxGeometry args={[0.3, 0.5, 0.1]} />
          <meshStandardMaterial color="#222" metalness={0.5} roughness={0.8} />
        </mesh>
        {/* Bouton lumineux */}
        <mesh position={[0, 0.1, 0.06]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial 
            color={buttonColor} 
            transparent
            opacity={hovered ? 1 : 0.6}
          />
        </mesh>
        {/* Lumière bouton */}
        <pointLight 
          position={[0, 0.1, 0.3]} 
          color={buttonColor}
          intensity={hovered ? 2 : 0.5}
          distance={2}
        />
        {/* Texte bouton */}
        <Html position={[0, -0.15, 0.06]} center>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '8px',
            color: '#888',
            whiteSpace: 'nowrap',
          }}>
            OPEN
          </div>
        </Html>
      </group>
      
      {/* ===== HITBOX INVISIBLE POUR CLIC ===== */}
      <mesh
        position={[0, 1.5, 0.3]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.5, 3.8, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* ===== LABEL AU-DESSUS ===== */}
      <Html position={[0, 4, 0.5]} center>
        <div style={{
          fontFamily: 'VT323, monospace',
          fontSize: '28px',
          color: hovered ? '#fff' : buttonColor,
          textShadow: `0 0 15px ${buttonColor}`,
          whiteSpace: 'nowrap',
          background: 'rgba(0,0,0,0.8)',
          padding: '8px 16px',
          border: `2px solid ${buttonColor}`,
          borderRadius: '4px',
          letterSpacing: '2px',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s',
        }}>
          {hovered ? `▶ ${label} ◀` : label}
        </div>
      </Html>
      
      {/* ===== LUMIÈRE AMBIANCE ===== */}
      <pointLight 
        position={[-1, 2, 2]} 
        color={buttonColor}
        intensity={hovered ? 1 : 0.3}
        distance={5}
      />
      
      {/* Glow au sol quand hover */}
      {hovered && (
        <mesh position={[0, 0.01, 1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial 
            color={buttonColor}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
    </group>
  );
}
```

---

## 🔴 Agent 2 : Remplacer dans SecurityRoomV2

**Fichier** : `app/components/three/SecurityRoomV2.tsx`

### Modifications

1. **Importer DoorFNAF** (remplace AnimatedMetalDoor) :
```tsx
import DoorFNAF from './DoorFNAF';
```

2. **Remplacer les 3 portes** :
```tsx
{/* Porte ILLUSTRATIONS */}
<DoorFNAF
  position={[4.5, 0, -2]}
  type="illustrations"
  label="ILLUSTRATIONS"
  stripeColor="#ffcc00"
  buttonColor="#00ff41"
  isOpening={openingDoor === 'illustrations'}
  onOpenComplete={() => {}}
  onClick={() => handlePortalClick('illustrations')}
/>

{/* Porte PHOTOS */}
<DoorFNAF
  position={[4.5, 0, 0]}
  type="photos"
  label="PHOTOS"
  stripeColor="#ffcc00"
  buttonColor="#ffaa00"
  isOpening={openingDoor === 'photos'}
  onOpenComplete={() => {}}
  onClick={() => handlePortalClick('photos')}
/>

{/* Porte VIDEOS */}
<DoorFNAF
  position={[4.5, 0, 2]}
  type="videos"
  label="VIDEOS"
  stripeColor="#ffcc00"
  buttonColor="#ff3333"
  isOpening={openingDoor === 'videos'}
  onOpenComplete={() => {}}
  onClick={() => handlePortalClick('videos')}
/>
```

3. **Ajuster l'éclairage** pour les portes :
```tsx
{/* Lumière globale zone portes */}
<pointLight position={[3, 3, 0]} intensity={0.5} color="#ffffff" distance={10} />
```

---

## 🔴 Agent 3 : Supprimer Ancien Composant

**Action** : Supprimer ou déprécier `AnimatedMetalDoor.tsx`

Optionnel : Renommer ou supprimer le fichier si plus utilisé.

---

## 📋 Checklist Validation

- [ ] 3 portes visibles avec cadre noir
- [ ] Rayures jaunes/noires en haut et bas de chaque porte
- [ ] Texture métal grunge sur le panneau central
- [ ] Bouton lumineux à droite (vert/orange/rouge)
- [ ] Label au-dessus avec glow
- [ ] Hover = glow + `▶ LABEL ◀`
- [ ] Clic = porte monte vers le haut (2s)
- [ ] Aspect industriel/lourd respecté

---

**Lancer les agents ?** 🚀
