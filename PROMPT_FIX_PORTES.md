# 🔧 Prompt - Correction Portes Non Visibles /hub

> **Problème** : Les 3 portes à droite ne s'affichent pas correctement - on voit juste les barres colorées (vert/orange/rouge). Impossible de cliquer dessus.

---

## 🎯 Objectifs

1. **Rendre les portes visibles** (taille, position, éclairage)
2. **Rendre les portes cliquables** (hitbox/hover)
3. **Ajouter des labels lisibles** sur les portes

---

## 🔴 Agent 1 : Diagnostic Position & Taille

**Fichier** : `app/components/three/SecurityRoomV2.tsx`

### Vérifier les positions actuelles

```tsx
// Les portes sont-elles à ces positions ?
<AnimatedMetalDoor position={[4.9, 0, -1.5]} ... />  // Illustrations
<AnimatedMetalDoor position={[4.9, 0, 0.5]} ... />    // Photos  
<AnimatedMetalDoor position={[4.9, 0, 2.5]} ... />    // Videos
```

### Problèmes possibles
- **X=4.9** : Trop proche du mur (5) → la porte est DANS le mur
- **Taille** : 1.6 x 2.4 m trop petit ?
- **Rotation** : `rotation={[0, -Math.PI/2, 0]}` → face à l'intérieur ?

### Corrections à tester

1. **Déplacer vers l'intérieur** : `position={[4.5, 0, -1.5]}` (au lieu de 4.9)
2. **Agrandir** : `args={[2, 3, 0.2]}` (au lieu de 1.6, 2.4, 0.15)
3. **Ajouter des lumières** devant les portes

---

## 🔴 Agent 2 : Améliorer AnimatedMetalDoor

**Fichier** : `app/components/three/AnimatedMetalDoor.tsx`

### Problèmes actuels
- Porte trop sombre (material gris foncé)
- Pas de contour visible
- Pas de gestion hover/click

### Corrections

```tsx
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
  onClick: () => void;  // AJOUTER
}

export default function AnimatedMetalDoor({
  position, type, label, color, isOpening, onOpenComplete, onClick
}: Props) {
  const [openProgress, setOpenProgress] = useState(0);
  const [hovered, setHovered] = useState(false);  // AJOUTER
  
  useEffect(() => {
    if (isOpening && openProgress < 1) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 2000, 1);
        setOpenProgress(progress);
        if (progress < 1) requestAnimationFrame(animate);
        else onOpenComplete();
      };
      animate();
    }
  }, [isOpening, onOpenComplete, openProgress]);
  
  const doorY = openProgress * 3;
  
  return (
    <group 
      position={position} 
      rotation={[0, -Math.PI / 2, 0]}
    >
      {/* Zone de clic invisible (plus grande) */}
      <mesh 
        position={[0, 1.5, 0.2]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.2, 3.2, 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Contour lumineux quand hover */}
      {hovered && (
        <mesh position={[0, 1.5, 0.15]}>
          <boxGeometry args={[2.1, 3.1, 0.1]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Porte metal */}
      <mesh position={[0, doorY, 0]}>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshStandardMaterial 
          color={hovered ? '#4a4a4a' : '#2a2a2a'} 
          metalness={0.8} 
          roughness={0.3}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Barre lumineuse en haut */}
      <mesh position={[0, 2.8, 0.15]}>
        <boxGeometry args={[1.8, 0.2, 0.05]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Label HTML */}
      <Html position={[0, 1.5, 0.3]} center transform>
        <div style={{ 
          fontFamily: 'VT323, monospace', 
          color: hovered ? '#fff' : color, 
          fontSize: '24px',
          textShadow: `0 0 10px ${color}`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.7)',
          padding: '4px 12px',
          border: `2px solid ${color}`,
          borderRadius: '4px'
        }}>
          {hovered ? `>> ${label} <<` : label}
        </div>
      </Html>
      
      {/* Lumière devant la porte */}
      <pointLight 
        position={[0, 1.5, 2]} 
        color={color} 
        intensity={hovered ? 2 : 0.5} 
        distance={5}
      />
    </group>
  );
}
```

---

## 🔴 Agent 3 : Corriger SecurityRoomV2

**Fichier** : `app/components/three/SecurityRoomV2.tsx`

### Modifications

1. **Corriger les positions** (trop proches du mur) :
```tsx
// AVANT (dans le mur)
position={[4.9, 0, -1.5]}

// APRÈS (visible à l'intérieur)
position={[4.5, 0, -1.5]}
```

2. **Ajouter la prop onClick** :
```tsx
<AnimatedMetalDoor 
  position={[4.5, 0, -1.5]}
  type="illustrations"
  label="ILLUSTRATIONS"
  color="#00ff41"
  isOpening={openingDoor === 'illustrations'}
  onOpenComplete={() => {}}
  onClick={() => handlePortalClick('illustrations')}  // AJOUTER
/>
```

3. **Ajouter une lumière ambiante supplémentaire** près des portes :
```tsx
{/* Lumière pour les portes */}
<pointLight position={[4, 2, 0]} intensity={0.5} color="#ffffff" distance={10} />
```

---

## 🔴 Agent 4 : Vérifier la Room

**Fichier** : `app/components/three/Room.tsx` (si existe)

Vérifier que :
1. Le mur droit ne bloque pas les portes
2. Les portes ne sont pas cachées par un autre mesh
3. La caméra voit bien la zone X>4

---

## 📋 Checklist Validation

- [ ] Les 3 portes sont visibles (gris foncé avec barre colorée)
- [ ] Au survol : glow + label highlighté + `>> LABEL <<`
- [ ] Au clic : la porte s'anime (monte pendant 2s)
- [ ] Les portes sont espacées (Z: -1.5, 0.5, 2.5)
- [ ] On distingue clairement les 3 portes

---

**Lancer les agents ?** 🚀
