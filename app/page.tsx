"use client";

/**
 * @file page.tsx
 * @description Page d'accueil avec BootSequence et transition vers le hub
 * @author Agent 6 - Routing & State Management
 * 
 * Flow:
 * 1. Affiche BootSequence
 * 2. onComplete → boot() → transition vers /hub
 * 3. Scanlines + CRTOverlay + NoiseOverlay
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BootSequence from "./components/ui/BootSequence";
import { Scanlines, CRTOverlay, NoiseOverlay } from "./components/ui";
import { SceneTransition } from "./components/SceneTransition";
import { useAppContext } from "./context/AppContext";

export default function Home() {
  const { boot, state } = useAppContext();
  const [showBoot, setShowBoot] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  /**
   * Gestion de la fin du boot
   * Déclenche la transition puis redirige vers /hub
   */
  const handleBootComplete = useCallback(() => {
    setIsTransitioning(true);
    
    // La transition dure ~500ms, on boot après le flash initial
    setTimeout(() => {
      boot();
    }, 200);
  }, [boot]);

  return (
    <main 
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Couche de base - BootSequence */}
      <AnimatePresence mode="wait">
        {showBoot && !state.booted && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0"
          >
            <BootSequence 
              onComplete={handleBootComplete}
              lineDelay={200}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Effets visuels globaux */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Scanlines */}
        <Scanlines opacity={0.12} />
        
        {/* Overlay CRT avec vignette */}
        <CRTOverlay 
          vignetteIntensity={0.5} 
          curvatureIntensity={0.25}
          flicker
        />
        
        {/* Bruit subtil */}
        <NoiseOverlay opacity={0.03} />
      </div>

      {/* Transition de scène */}
      <SceneTransition
        isActive={isTransitioning}
        duration={500}
        text="INITIALIZING..."
      />

      {/* Message de redirection (affiché brièvement) */}
      <AnimatePresence>
        {state.booted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-20"
            style={{ backgroundColor: '#0a0a0a' }}
          >
            <div className="text-center">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-2xl font-mono"
                style={{ color: '#00ff41', textShadow: '0 0 10px #00ff41' }}
              >
                CONNECTING TO SECURE HUB...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
