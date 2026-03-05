# 🔧 Prompt Orchestré - Debug Hub /hub

> **Objectif** : Le hub affiche uniquement un cube fil de fer au lieu de la scène 3D complète. Corriger les bugs et nettoyer le code.

---

## 🐛 PROBLÈME OBSERVÉ

**Symptôme** : Page `/hub` = cube fil de fer vert au centre, pas de scène 3D
**Attendu** : Bureau de surveillance FNAF avec portes, écrans, bureau

---

## 🔴 Agent 1 : Diagnostic & Logs

**Mission** : Identifier pourquoi SecurityRoomV2 ne s'affiche pas.

### Tâches

1. **Vérifier la console navigateur** (si possible) ou ajouter des logs
2. **Ajouter des console.log** dans `SecurityRoomV2.tsx` :
   - Au début du composant : `console.log("[SecurityRoomV2] Render")`
   - Dans useEffect : `console.log("[SecurityRoomV2] Mounted")`
   - Avant le return : `console.log("[SecurityRoomV2] Rendering scene")`

3. **Vérifier AnimatedMetalDoor** :
   - Le composant plante-t-il ?
   - Ajouter try/catch autour du return
   - Simplifier temporairement pour tester

4. **Vérifier les imports** :
   - Tous les imports sont-ils valides ?
   - Pas de cycle d'imports ?

---

## 🔴 Agent 2 : Simplification AnimatedMetalDoor

**Mission** : Si AnimatedMetalDoor plante, le simplifier drastiquement.

### Fichier : `app/components/three/AnimatedMetalDoor.tsx`

**Remplacer temporairement par** :

```tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface AnimatedMetalDoorProps {
  position: [number, number, number];
  type: 'illustrations' | 'photos' | 'videos';
  label: string;
  color: string;
  isOpening: boolean;
  onOpenComplete: () => void;
}

export default function AnimatedMetalDoor({
  position,
  type,
  label,
  color,
  isOpening,
  onOpenComplete,
}: AnimatedMetalDoorProps) {
  const [openProgress, setOpenProgress] = useState(0);
  
  useEffect(() => {
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
  }, [isOpening, onOpenComplete, openProgress]);
  
  const doorY = openProgress * 3;
  
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Porte simple */}
      <mesh position={[0, doorY, 0]}>
        <boxGeometry args={[1.6, 2.4, 0.15]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Label */}
      <mesh position={[0, 1.6, 0.1]}>
        <planeGeometry args={[1.4, 0.3]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
```

**Objectif** : Version minimaliste sans Text 3D, sans détails complexes.

---

## 🔴 Agent 3 : Vérifier SecurityRoomV2

**Mission** : S'assurer que SecurityRoomV2 rend correctement.

### Fichier : `app/components/three/SecurityRoomV2.tsx`

### Tâches

1. **Vérifier les états initiaux** :
```tsx
// S'assurer que les états sont bien initialisés
const [openingDoor, setOpeningDoor] = useState<string | null>(null);
const [isZooming, setIsZooming] = useState(false);
```

2. **Vérifier que le return n'est pas vide** :
```tsx
// Ajouter en début de return
console.log("[SecurityRoomV2] Rendering, openingDoor:", openingDoor);
```

3. **Vérifier CameraZoomEffect** :
- S'assurer qu'il ne plante pas
- Vérifier `camera instanceof THREE.PerspectiveCamera`

4. **Vérifier les composants internes** :
- Room
- SurveillanceScreen  
- MainScreen
- FlickeringNeon

---

## 🔴 Agent 4 : Fallback & Error Boundary

**Mission** : Ajouter des mécanismes de fallback.

### Fichier : `app/hub/page.tsx`

### Tâches

1. **Modifier LoadingScene3D** pour indiquer l'état :
```tsx
function LoadingScene3D() {
  useEffect(() => {
    console.log("[LoadingScene3D] Fallback actif - SecurityRoom non chargé");
  }, []);
  
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff0000" wireframe />
      </mesh>
      {/* Texte d'erreur */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.5}
        color="#ff0000"
      >
        CHARGEMENT...
      </Text>
    </>
  );
}
```

2. **Modifier ErrorBoundary** pour afficher l'erreur :
```tsx
// Dans le render de ErrorBoundary
<div className="text-red-500 font-mono p-4">
  <h2>ERREUR 3D</h2>
  <pre>{this.state.error?.message}</pre>
  <pre>{this.state.error?.stack}</pre>
</div>
```

---

## 🔴 Agent 5 : Test & Validation

**Mission** : Vérifier que tout fonctionne.

### Checklist

- [ ] Cube rouge remplacé par la scène complète
- [ ] 3 portes visibles
- [ ] 4 écrans visibles
- [ ] Bureau visible
- [ ] Clic sur porte = animation
- [ ] Navigation fonctionne
- [ ] Console sans erreur rouge

### Commandes

```bash
npm run build
npm run dev
```

---

## 📋 Résumé pour Orchestration

### Ordre d'exécution
1. **Agent 1** → Ajouter logs diagnostic
2. **Agent 2** → Simplifier AnimatedMetalDoor (supprimer Text 3D)
3. **Agent 3** → Vérifier SecurityRoomV2
4. **Agent 4** → Améliorer ErrorBoundary
5. **Agent 5** → Test final

### Fichiers à modifier
- `app/components/three/AnimatedMetalDoor.tsx` (simplifier)
- `app/components/three/SecurityRoomV2.tsx` (vérifier)
- `app/hub/page.tsx` (ErrorBoundary, LoadingScene)
- `app/components/ErrorBoundary.tsx` (améliorer)

---

Lancer les agents ? 🚀
