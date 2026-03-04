# Horror Portfolio - Documentation

## EASTER EGGS

### 1. Konami Code (↑↑↓↓←→←→BA)
- **Activation**: Entrer la séquence ↑ ↑ ↓ ↓ ← → ← → B A
- **Effet**: Active le mode debug avec wireframe et stats Three.js
- **Persistance**: Stocké dans sessionStorage pour la session courante
- **Visuel**: Bannière "DEBUG MODE ACTIVÉ" en haut de l'écran

### 2. Jumpscare
- **Activation**: Aléatoire - 1% de chance toutes les 2 minutes
- **Effet**: Flash d'image effrayante + son playRareGlitch()
- **Durée**: 500ms
- **Désactivation**: Automatique en mode debug
- **Fichier**: `app/components/easter-eggs/Jumpscare.tsx`

### 3. Fake Virus
- **Activation**: Très rare - 0.05% de chance toutes les 30 secondes
- **Effet**: Fenêtre style Windows 95 "VIRUS DETECTED"
- **Interaction**: Bouton "PANIC" pour fermer
- **Effet visuel**: Shake de l'écran + fausse barre de progression
- **Intervalle minimum**: 5 minutes entre chaque apparition
- **Fichier**: `app/components/easter-eggs/FakeVirus.tsx`

### 4. Secret Cursor
- **Activation**: Inactivité souris de 10 secondes
- **Effet**: Curseur change en "?"
- **Retour**: Au mouvement de la souris
- **Portée**: Global sur toute l'application
- **Fichier**: `app/components/easter-eggs/SecretCursor.tsx`

### 5. Ctrl+G - Toggle Glitch Mode
- **Activation**: Raccourci clavier Ctrl+G
- **Effet**: Active/désactive le mode glitch global
- **Visuel**: Changement de statut système (vert → rouge)
- **Implémentation**: `KeyboardHandler.tsx`

## DEBUG MODE

### Activation
1. **Via URL**: Ajouter `?debug=true` à l'URL
2. **Via Konami Code**: ↑ ↑ ↓ ↓ ← → ← → B A

### Features
- **FPS Counter**: Mis à jour via requestAnimationFrame
- **Stats Three.js**: Draw calls, triangles, geometries, textures, mémoire
- **Toggle Wireframe**: Active/désactive le mode fil de fer sur tous les meshes
- **Toggle Lights**: Active/désactive toutes les lumières
- **Axes Helper**: Affiche les axes XYZ
- **Grid Helper**: Affiche une grille au sol
- **Camera Info**: Position et rotation en temps réel

### Interface
```
┌─ DEBUG MODE ───────────────┐
│ FPS: 60                    │
│ Draw Calls: 24             │
│ Triangles: 12,450          │
│ Geometries: 15             │
│ Textures: 8                │
│ Memory: 45 MB              │
├─ Camera ───────────────────┤
│ Cam Pos: 0.00, 1.60, 4.00  │
│ Cam Rot: -15.0°, 0.0°, 0.0°│
├─ Controls ─────────────────┤
│ [ ] Wireframe: OFF         │
│ [ ] Lights: ON             │
│ [ ] Axes Helper: OFF       │
├─ Shortcuts ────────────────┤
│ Ctrl+G: Toggle Glitch      │
│ ?debug=true: Force debug   │
└────────────────────────────┘
```

## ARCHITECTURE

### Structure des dossiers
```
app/
├── components/
│   ├── easter-eggs/     # Easter eggs (Konami, Jumpscare, etc.)
│   ├── debug/           # Outils de debug
│   ├── media/           # Composants médias (gallery, viewer)
│   ├── three/           # Scène Three.js
│   ├── ui/              # Composants UI rétro
│   ├── KeyboardHandler.tsx
│   └── SceneTransition.tsx
├── context/
│   ├── AppContext.tsx   # State global
│   └── AudioContext.tsx # Gestion audio
├── hooks/
│   ├── useAudio.ts      # Hook audio Howler
│   ├── useMedia.ts      # Hook médias
│   └── useRandomGlitch.ts
├── lib/
│   ├── audioGenerator.ts
│   ├── sounds.ts
│   └── uploadthing.ts   # Types et données médias
├── gallery/
│   └── [type]/
│       └── page.tsx     # Pages galerie 2D
├── hub/
│   └── page.tsx         # Hub 3D principal
├── page.tsx             # Boot sequence
├── layout.tsx           # Root layout
└── globals.css          # Styles globaux
```

### Providers (ordre d'imbrication)
```
AppProvider
└── AudioProvider
    └── WebGLChecker
        └── SecretCursor
            └── [Application]
```

## OPTIMISATIONS

### Build (next.config.ts)
- **Code Splitting**: Séparation Three.js dans un chunk dédié
- **Compression**: gzip activée
- **Headers sécurité**: X-Content-Type-Options, X-Frame-Options
- **PoweredByHeader**: Désactivé
- **Images**: WebP/AVIF prioritaires

### Performance Three.js
- **Lazy Loading**: Three.js chargé uniquement sur /hub
- **UseMemo**: Matériaux et géométries mémorisés
- **Draw Calls**: Géométries simples, instancing où possible
- **Textures**: Compression WebP via UploadThing

### Audio
- **Lazy Loading**: Sons chargés à la demande via Howler
- **Context Suspension**: Respect des politiques navigateur
- **Volume par défaut**: 20% pour ne pas agresser

## RACCOURCIS CLAVIER

| Touche | Action |
|--------|--------|
| `ESC` | Fermer viewer / retour |
| `Ctrl+G` | Toggle glitch mode |
| `← →` | Naviguer médias (dans viewer) |
| `M` | Mute/unmute audio |
| `↑↑↓↓←→←→BA` | Konami code (debug) |

## TYPES DE MÉDIAS

| Type | Route | Description |
|------|-------|-------------|
| illustrations | `/gallery/illustrations` | Art digital, concept art |
| photos | `/gallery/photos` | Photographie, portraits |
| videos | `/gallery/videos` | Animation, motion design |

## FALLBACKS

### WebGL Non Supporté
- Détection automatique au montage
- Redirection vers galerie 2D
- Message explicatif avec liens directs

### Audio Bloqué
- Détection de l'état du contexte audio
- Activation après interaction utilisateur
- Fallback silencieux si refusé

## DÉVELOPPEMENT

### Lancer le projet
```bash
npm install
npm run dev
```

### Build production
```bash
npm run build
```

### Tests navigateurs
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
- Edge (desktop)

## NOTES

### Easter Eggs
- Tous les easter eggs sont optionnels et non intrusifs
- Ils ne bloquent pas la navigation principale
- Pas de crash si des features sont bloquées par le navigateur
- Respect de la vie privée (pas de tracking)

### Compatibilité
- WebGL 1.0 minimum requis
- ES2015+ requis
- Howler.js pour l'audio (Web Audio API)

### Agents ayant contribué
- Agent 1: Initial Setup
- Agent 2: UI Components
- Agent 3: Three.js Environment
- Agent 4: Gallery System
- Agent 5: Audio & Atmosphere
- Agent 6: Routing & State Management
- Agent 7: Polish & Debug (Easter Eggs, Optimisations)
