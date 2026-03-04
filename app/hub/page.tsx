"use client";

/**
 * @file page.tsx
 * @description Hub 3D complet - Bureau de Surveillance style FNAF
 * @author Agent 6 - Routing & State Management
 * @modified Agent 7 - Intégration Easter Eggs et Debug
 * 
 * Intègre:
 * - SecurityRoom avec callbacks via AppContext
 * - DoorPortals onPortalClick → openGallery(type)
 * - MainScreen avec média aléatoire
 * - MediaViewer overlay quand selectedMedia
 * - Gestion ESC pour fermer viewer
 * - Easter Eggs: KonamiCode, Jumpscare, FakeVirus, SecretCursor
 * - DebugOverlay conditionnel
 */

import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { SecurityRoom } from "../components/three";
import { Scanlines, CRTOverlay, TerminalText } from "../components/ui";
import { MediaViewer } from "../components/media";
import { SceneTransition } from "../components/SceneTransition";
import { useAppContext } from "../context/AppContext";
import { useOptionalAudioContext } from "../context/AudioContext";
import { Media, MediaType, getRandomMedia, getMediaByType } from "../lib/uploadthing";

// Easter Eggs
import { 
  useKonamiCode, 
  useJumpscare, 
  useFakeVirus,
  JumpscareOverlay,
  FakeVirusWindow,
} from "../components/easter-eggs";

// Debug
import { DebugOverlay } from "../components/debug";
import { ErrorBoundary } from "../components/ErrorBoundary";

/**
 * Fallback si WebGL non supporté
 */
function WebGLFallback() {
  const { openGallery } = useAppContext();
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-8 bg-horror-panel rounded-lg border border-horror-terminal/30 max-w-md">
        <TerminalText 
          text="[MODE 2D ACTIVÉ]" 
          color="terminal" 
          fontSize={24}
          className="mb-4"
        />
        <p className="text-horror-terminal/70 mb-6">
          WebGL non disponible. Accès aux archives en mode 2D.
        </p>
        <div className="space-y-3">
          {(["illustrations", "photos", "videos"] as MediaType[]).map((type) => (
            <button
              key={type}
              onClick={() => openGallery(type)}
              className="block w-full px-4 py-3 border border-horror-terminal/50 text-horror-terminal hover:bg-horror-terminal/20 transition-colors font-mono uppercase"
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Écran de chargement
 */
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-full bg-horror-bg">
      <div className="text-center">
        <TerminalText 
          text="CHARGEMENT DU SYSTÈME..."
          color="terminal" 
          fontSize={32}
          className="mb-4"
        />
        <div className="w-64 h-2 bg-horror-panel rounded overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-horror-terminal"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading 3D Scene
 */
function LoadingScene3D() {
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#00ff41" wireframe />
      </mesh>
    </>
  );
}

/**
 * Composant Three.js interne pour le debug overlay
 * Doit être rendu dans le Canvas
 */
function DebugOverlayInCanvas({ isVisible }: { isVisible: boolean }) {
  const { scene } = useThree();
  const [wireframe, setWireframe] = useState(false);
  const [lightsEnabled, setLightsEnabled] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      // Reset quand on quitte le debug
      setWireframe(false);
      setLightsEnabled(true);
      return;
    }
  }, [isVisible]);

  // Applique wireframe
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) 
          ? child.material 
          : [child.material];
        materials.forEach((mat) => {
          mat.wireframe = wireframe;
        });
      }
    });
  }, [wireframe, scene]);

  // Toggle lights
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        child.visible = lightsEnabled;
      }
    });
  }, [lightsEnabled, scene]);

  if (!isVisible) return null;

  return (
    <>
      <axesHelper args={[5]} />
      <gridHelper args={[20, 20, 0xff0000, 0x444444]} />
    </>
  );
}

import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/**
 * Page Hub - Bureau de Surveillance 3D
 * Point d'entrée vers les différentes galeries
 */
export default function HubPage() {
  const router = useRouter();
  const { 
    state, 
    openGallery, 
    openMedia, 
    closeMedia,
    nextMedia,
    prevMedia,
  } = useAppContext();
  
  const audioContext = useOptionalAudioContext();
  
  const [hoveredScreen, setHoveredScreen] = useState<string | null>(null);
  const [webglError, setWebglError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mainScreenMedia, setMainScreenMedia] = useState<Media | null>(null);

  // Easter Eggs
  const { isDebugMode } = useKonamiCode();
  const { isActive: jumpscareActive } = useJumpscare({ 
    disabled: isDebugMode // Désactivé en mode debug
  });
  const { isVisible: virusVisible, hide: hideVirus } = useFakeVirus({
    disabled: isDebugMode
  });

  // Charger un média aléatoire pour le MainScreen
  useEffect(() => {
    setMainScreenMedia(getRandomMedia());
  }, []);

  // Gestion du clic sur un portail
  const handlePortalClick = useCallback((type: MediaType) => {
    setIsTransitioning(true);
    audioContext?.playDoorCreak?.();
    
    // Transition avant navigation
    setTimeout(() => {
      openGallery(type);
    }, 400);
  }, [openGallery, audioContext]);

  // Gestion du hover sur les écrans
  const handleScreenHover = useCallback((screen: string | null) => {
    setHoveredScreen(screen);
  }, []);

  // Gestion du clic sur l'écran principal
  const handleMainScreenClick = useCallback(() => {
    if (mainScreenMedia) {
      // Récupère la liste complète pour la navigation
      const mediaList = getMediaByType(mainScreenMedia.type);
      const index = mediaList.findIndex(m => m.id === mainScreenMedia.id);
      openMedia(mainScreenMedia, index >= 0 ? index : 0, mediaList);
      audioContext?.playBeep?.();
    }
  }, [mainScreenMedia, openMedia, audioContext]);

  // Déterminer si on peut naviguer dans le viewer
  const canNavigate = state.currentMediaList.length > 1;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-horror-bg">
      {/* Canvas 3D */}
      <div className="absolute inset-0 z-0" style={{ pointerEvents: 'auto' }}>
        <ErrorBoundary>
          <Canvas
            camera={{ 
              position: [0, 1.6, 4], 
              fov: 60,
              near: 0.1,
              far: 100
            }}
            gl={{ 
              antialias: true,
              alpha: false,
              powerPreference: "high-performance"
            }}
            onError={(e) => {
              console.error("Canvas Error:", e);
              setWebglError(true);
            }}
            style={{ background: '#0a0a0a' }}
            tabIndex={0}
          >
            <color attach="background" args={['#0a0a0a']} />
            <Suspense fallback={<LoadingScene3D />}>
              <SecurityRoom 
                onPortalClick={handlePortalClick}
                onScreenHover={handleScreenHover}
                debugMode={isDebugMode}
              />
              {/* Debug overlay dans le canvas */}
              <DebugOverlayInCanvas isVisible={isDebugMode} />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanlines */}
        <Scanlines opacity={0.15} />
        
        {/* Overlay CRT */}
        <CRTOverlay vignetteIntensity={0.4} curvatureIntensity={0.3} flicker />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <TerminalText 
              text="BUREAU DE SURVEILLANCE"
              color="terminal" 
              fontSize={32}
            />
            <p className="text-horror-terminal/50 text-sm mt-1 font-mono">
              SECTEUR 7G // NIVEAU SÉCURITÉ: MAX
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-right"
          >
            <div className="flex items-center gap-2 text-horror-terminal/70">
              <span 
                className={`w-2 h-2 rounded-full animate-pulse ${
                  state.systemStatus === "glitch" 
                    ? "bg-red-500" 
                    : state.systemStatus === "warning"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`} 
              />
              <span className="font-mono text-sm">
                SYSTÈME {state.systemStatus === "online" ? "EN LIGNE" : state.systemStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-horror-terminal/40 text-xs mt-1 font-mono">
              {new Date().toLocaleTimeString()}
            </p>
          </motion.div>
        </div>

        {/* Info écran survolé */}
        <AnimatePresence>
          {hoveredScreen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-6 p-4 bg-horror-panel/80 border border-horror-terminal/30 rounded pointer-events-auto"
            >
              <TerminalText 
                text={`[CAM-${hoveredScreen.toUpperCase()}]`}
                color="terminal" 
                fontSize={16}
              />
              <p className="text-horror-terminal/60 text-xs mt-1 font-mono">
                Cliquez pour analyser le flux vidéo
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info écran principal */}
        <AnimatePresence>
          {mainScreenMedia && !state.selectedMedia && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <div className="text-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-horror-terminal/30 text-xs font-mono">
                  CLIQUEZ POUR AGRANDIR
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer - Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end"
        >
          <div className="text-horror-terminal/40 text-xs font-mono space-y-1">
            <p>→ Déplacez la souris pour regarder autour</p>
            <p>→ Cliquez sur une porte pour entrer dans une archive</p>
            <p>→ Survolez les écrans pour plus d&apos;infos</p>
            <p>→ <kbd className="px-1 border border-horror-terminal/30 rounded">ESC</kbd> pour fermer le viewer</p>
            {/* Hint easter egg discret */}
            <p className="text-horror-terminal/20 mt-2">v1.0.4 // BUILD 2026</p>
          </div>
          
          <div className="text-horror-terminal/30 text-xs font-mono text-right">
            <p>FNAF SECURITY SYSTEM</p>
            <p className="mt-1 text-horror-terminal/20">
              PID: {Math.random().toString(36).substring(2, 8).toUpperCase()}
            </p>
          </div>
        </motion.div>
      </div>

      {/* MediaViewer Overlay - Debug: selectedMedia id */}
      {state.selectedMedia && (
        <div className="fixed inset-0 z-50" style={{ pointerEvents: 'auto' }}>
          <MediaViewer
            media={state.selectedMedia}
            onClose={closeMedia}
            onNext={canNavigate ? nextMedia : undefined}
            onPrev={canNavigate ? prevMedia : undefined}
          />
        </div>
      )}

      {/* Transition vers portail */}
      <SceneTransition
        isActive={isTransitioning}
        duration={400}
        text={state.selectedCategory ? `ACCES: ${state.selectedCategory.toUpperCase()}` : undefined}
      />

      {/* Fallback WebGL */}
      {webglError && (
        <div className="absolute inset-0 z-50">
          <WebGLFallback />
        </div>
      )}

      {/* Easter Eggs */}
      
      {/* Debug Mode Indicator */}
      {isDebugMode && (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
          <div className="bg-red-600 text-white text-center py-1 font-mono text-sm font-bold animate-pulse">
            ⚠ DEBUG MODE ACTIVÉ ⚠
          </div>
        </div>
      )}

      {/* Debug Overlay complet */}
      <DebugOverlay isVisible={isDebugMode} />

      {/* Jumpscare */}
      <JumpscareOverlay isActive={jumpscareActive} debugMode={isDebugMode} />

      {/* Fake Virus */}
      <FakeVirusWindow isVisible={virusVisible} onClose={hideVirus} />
    </main>
  );
}
