# 🔧 Prompt Orchestré - Portes Animées & Effet Téléportation

> **Objectif** : Transformer les portes en portes métalliques lourdes qui s'ouvrent avec animation, sons et effet de téléportation
> **Fichier principal** : `app/components/three/SecurityRoomV2.tsx`

---

## 🎨 SPÉCIFICATIONS DU CLIENT

| Aspect | Détail |
|--------|--------|
| **Style porte** | Plaques métalliques pleines, industriel lourd |
| **Animation** | Porte se soulève complètement (vers le haut) |
| **Effet** | Secousse/vibration pendant l'ouverture |
| **Caméra** | Reste fixe, observe l'ouverture |
| **Durée zoom** | 1.5 secondes après ouverture |
| **Son** | Bruit moteur + grincement métallique |
| **Transition** | Téléportation avec static/scanlines |

---

## 🔴 Agent 1 : Modèle 3D Porte Métallique

**Mission** : Créer un nouveau composant `AnimatedMetalDoor.tsx` avec le modèle 3D détaillé.

### Fichier : `app/components/three/AnimatedMetalDoor.tsx`

```tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface AnimatedMetalDoorProps {
  position: [number, number, number];
  type: 'illustrations' | 'photos' | 'videos';
  label: string;
  color: string;
  isOpening: boolean;  // Déclenche l'animation
  onOpenComplete: () => void;  // Callback fin animation
}

export default function AnimatedMetalDoor({
  position,
  type,
  label,
  color,
  isOpening,
  onOpenComplete,
}: AnimatedMetalDoorProps) {
  const doorGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [shakeOffset, setShakeOffset] = useState(0);
  const [openProgress, setOpenProgress] = useState(0); // 0 = fermé, 1 = ouvert
  
  // Animation d'ouverture
  useEffect(() => {
    if (isOpening && openProgress < 1) {
      const duration = 2000; // 2 secondes pour ouverture complète
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing pour mouvement lourd
        const eased = 1 - Math.pow(1 - progress, 3);
        setOpenProgress(eased);
        
        // Secousse pendant l'ouverture (premiers 30%)
        if (progress < 0.3) {
          setShakeOffset(Math.sin(progress * 20) * 0.02);
        } else {
          setShakeOffset(0);
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onOpenComplete();
        }
      };
      
      animate();
    }
  }, [isOpening, onOpenComplete]);
  
  // Position Y animée (soulèvement)
  const doorY = openProgress * 3; // Monte de 3 unités
  
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Cadre de porte (fixe) */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[1.8, 2.6, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3" />
      </mesh>
      
      {/* Porte métallique (animée) */}
      <group 
        ref={doorGroupRef}
        position={[shakeOffset, doorY, 0]}
      >
        {/* Plaque métallique principale */}
        <mesh>
          <boxGeometry args={[1.6, 2.4, 0.15]} />
          <meshStandardMaterial 
            color="#3a3a3a" 
            roughness={0.6} 
            metalness={0.9}
          />
        </mesh>
        
        {/* Rainures horizontales (détail industriel) */}
        {[0.6, 0.2, -0.2, -0.6].map((y, i) => (
          <mesh key={i} position={[0, y, 0.08]}>
            <boxGeometry args={[1.5, 0.08, 0.02]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        ))}
        
        {/* Boulons aux coins */}
        {[
          [-0.7, 1.1], [0.7, 1.1],
          [-0.7, -1.1], [0.7, -1.1],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.08]}>
            <cylinderGeometry args={[0.04, 0.04, 0.05, 6]} />
            <meshStandardMaterial color="#555" metalness={1} />
          </mesh>
        ))}
        
        {/* Lumière colorée sur la porte */}
        <mesh position={[0, 0, 0.08]}>
          <planeGeometry args={[1.4, 2.2]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.6 : 0.3}
            transparent
            opacity={0.15}
          />
        </mesh>
        
        {/* Poignée industrielle */}
        <mesh position={[0.5, 0, 0.12]}>
          <boxGeometry args={[0.15, 0.4, 0.08]} />
          <meshStandardMaterial color="#666" metalness={0.9} />
        </mesh>
      </group>
      
      {/* Label au-dessus de la porte */}
      <Text 
        position={[0, 1.6, 0.2]} 
        fontSize={0.2} 
        color={hovered ? '#fff' : color}
        anchorX="center"
      >
        {label}
      </Text>
      
      {/* Lumière indicateur (vert/orange/rouge) */}
      <pointLight 
        position={[0, 2.2, 0.3]} 
        color={color}
        intensity={hovered || isOpening ? 3 : 1}
        distance={5}
      />
      
      {/* Halo au sol */}
      <mesh position={[0, -2.3, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={(hovered || isOpening) ? 0.3 : 0.1} 
        />
      </mesh>
    </group>
  );
}
```

### Livrable
- Composant `AnimatedMetalDoor.tsx` créé
- Porte métallique avec rainures et boulons
- Animation de soulèvement avec secousse

---

## 🔴 Agent 2 : Sons & Audio

**Mission** : Ajouter les sons de porte métallique qui s'ouvre.

### Fichier : `app/hooks/useDoorSound.ts`

```tsx
'use client';

import { useCallback } from 'react';
import { Howl } from 'howler';

// Sons générés ou URLs
const DOOR_SOUNDS = {
  // Grincement métallique initial
  creak: 'data:audio/wav;base64,...', // Ou URL
  // Moteur électrique
  motor: 'data:audio/wav;base64,...', // Ou URL
  // Claquement final
  slam: 'data:audio/wav;base64,...', // Ou URL
};

export function useDoorSound() {
  const playDoorOpen = useCallback(() => {
    // Grincement au début
    const creak = new Howl({
      src: [DOOR_SOUNDS.creak],
      volume: 0.6,
    });
    creak.play();
    
    // Moteur pendant l'ouverture (après 200ms)
    setTimeout(() => {
      const motor = new Howl({
        src: [DOOR_SOUNDS.motor],
        volume: 0.4,
        loop: false,
      });
      motor.play();
    }, 200);
  }, []);
  
  return { playDoorOpen };
}

export default useDoorSound;
```

### Alternative (sans fichier son)
Générer procéduralement avec Web Audio API dans `app/lib/sounds.ts`.

### Livrable
- Hook `useDoorSound` créé
- Son joué quand `isOpening` passe à true

---

## 🔴 Agent 3 : Gestion État & Séquence

**Mission** : Modifier `SecurityRoomV2.tsx` pour gérer la séquence complète.

### Modifications dans `SecurityRoomV2.tsx` :

```tsx
// AJOUTER ÉTAT
const [openingDoor, setOpeningDoor] = useState<string | null>(null);
const [isZooming, setIsZooming] = useState(false);
const { playDoorOpen } = useDoorSound();

// MODIFIER handlePortalClick
const handlePortalClick = useCallback((type: MediaType) => {
  if (openingDoor) return; // Déjà en cours
  
  setOpeningDoor(type);
  playDoorOpen();
  
  // Attendre fin animation porte (2s) + zoom (1.5s)
  setTimeout(() => {
    setIsZooming(true);
    
    // Après zoom, navigation
    setTimeout(() => {
      onPortalClick(type);
    }, 1500);
  }, 2000);
}, [onPortalClick, openingDoor, playDoorOpen]);

// DANS LE RETURN
<AnimatedMetalDoor 
  position={[4.9, 0, -1.5]}
  type="illustrations"
  label="ILLUSTRATIONS"
  color="#00ff41"
  isOpening={openingDoor === 'illustrations'}
  onOpenComplete={() => {}} // Géré par setTimeout
/>
// etc pour les 3 portes

// AJOUTER EFFET ZOOM CAMÉRA (overlay)
{isZooming && (
  <CameraZoomEffect target={openingDoor} />
)}
```

### Livrable
- Gestion séquence : clic → ouverture → zoom → navigation
- Bloque les clics multiples pendant animation

---

## 🔴 Agent 4 : Effet Zoom & Téléportation

**Mission** : Créer les composants visuels pour le zoom et la téléportation.

### 4.1 CameraZoomEffect.tsx

```tsx
'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraZoomEffectProps {
  target: string | null; // 'illustrations' | 'photos' | 'videos'
}

export default function CameraZoomEffect({ target }: CameraZoomEffectProps) {
  const { camera } = useThree();
  const startPos = useRef(camera.position.clone());
  const startTime = useRef(Date.now());
  
  // Direction selon la porte
  const targetPositions = {
    illustrations: new THREE.Vector3(4.5, 1, -1.5),
    photos: new THREE.Vector3(4.5, 1, 0),
    videos: new THREE.Vector3(4.5, 1, 1.5),
  };
  
  useFrame(() => {
    if (!target) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / 1.5, 1); // 1.5s
    
    // Easing
    const eased = progress * progress; // Accélération
    
    const targetPos = targetPositions[target as keyof typeof targetPositions];
    camera.position.lerpVectors(startPos.current, targetPos, eased);
    
    // Effet FOV qui s'élargit
    camera.fov = 60 + (progress * 30); // 60 → 90
    camera.updateProjectionMatrix();
  });
  
  return null;
}
```

### 4.2 TeleportTransition.tsx (Overlay 2D)

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TeleportTransitionProps {
  isActive: boolean;
  text?: string;
}

export default function TeleportTransition({ isActive, text }: TeleportTransitionProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* Bruit blanc */}
          <div 
            className="absolute inset-0 bg-white"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              opacity: 0.8,
            }}
          />
          
          {/* Scanlines */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
              opacity: 0.5,
            }}
          />
          
          {/* Texte */}
          {text && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-horror-terminal font-mono text-2xl tracking-widest"
                style={{ textShadow: '0 0 20px #00ff41' }}
              >
                {text}
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Livrable
- Zoom caméra qui avance vers la porte ouverte
- Effet téléportation (bruit blanc + scanlines)

---

## 🔴 Agent 5 : Intégration & Polish

**Mission** : Intégrer tous les composants et ajuster timings.

### Modifications finales `hub/page.tsx` :

```tsx
// AJOUTER IMPORTS
import TeleportTransition from '../components/three/TeleportTransition';

// AJOUTER ÉTAT
const [showTeleport, setShowTeleport] = useState(false);

// MODIFIER handlePortalClick dans SecurityRoomV2
// Au moment de la navigation :
setShowTeleport(true);
setTimeout(() => {
  router.push(`/gallery/${type}`);
}, 300);

// DANS LE RETURN (après Canvas)
<TeleportTransition 
  isActive={showTeleport} 
  text={openingDoor?.toUpperCase()}
/>
```

### Livrable
- Tous les composants intégrés
- Timing cohérent (2s ouverture + 1.5s zoom + 0.3s transition)

---

## 📋 Résumé pour Orchestration

### Ordre d'exécution
1. **Agent 1** → Créer AnimatedMetalDoor.tsx
2. **Agent 2** → Créer useDoorSound.ts
3. **Agent 3** → Modifier SecurityRoomV2 (gestion état)
4. **Agent 4** → Créer CameraZoomEffect + TeleportTransition
5. **Agent 5** → Intégration finale dans hub/page.tsx

### Timing de la séquence
```
0.0s  → Clic sur porte
0.0s  → Son grincement + lumière clignote
0.0s  → Secousse/vibration commence
0.2s  → Son moteur démarre
0.0-2.0s → Porte se soulève
2.0s  → Zoom caméra démarre
2.0-3.5s → Zoom vers l'ouverture (1.5s)
3.5s  → Effet téléportation (bruit blanc)
3.8s  → Navigation vers galerie
```

### Checklist finale
- [ ] Porte métallique détaillée (rainures, boulons)
- [ ] Animation soulèvement avec secousse
- [ ] Sons grincement + moteur
- [ ] Zoom caméra 1.5s
- [ ] Effet téléportation (static + scanlines)
- [ ] Timing cohérent
- [ ] Build passe

---

Voulez-vous que je lance les Agents pour implémenter ces modifications ? 🎮
