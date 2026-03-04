"use client";

/**
 * @file SceneTransition.tsx
 * @description Transition entre scènes avec effet de téléportation static flash
 * @author Agent 6 - Routing & State Management
 * 
 * Effet:
 * - White flash rapide
 * - Static noise pendant la transition
 * - Durée: 300-500ms
 */

import { motion, AnimatePresence } from "framer-motion";

export interface SceneTransitionProps {
  /** Afficher la transition */
  isActive: boolean;
  /** Callback quand la transition est terminée */
  onComplete?: () => void;
  /** Durée de la transition en ms */
  duration?: number;
  /** Texte à afficher pendant la transition */
  text?: string;
}

/**
 * Composant de transition entre scènes style téléportation
 * Utilisé pour les transitions boot→hub et hub→gallery
 */
export function SceneTransition({
  isActive,
  onComplete,
  duration = 400,
  text,
}: SceneTransitionProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 2000 }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Flash blanc initial */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.8, 1, 0] }}
            transition={{ duration: duration / 1000, times: [0, 0.3, 0.5, 1] }}
            className="absolute inset-0 bg-white"
          />

          {/* Static noise overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: duration / 1000, times: [0, 0.2, 0.7, 1] }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />

          {/* Scanlines pendant la transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.5, 0] }}
            transition={{ duration: duration / 1000, times: [0, 0.2, 0.7, 1] }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.5) 2px,
                rgba(0, 0, 0, 0.5) 4px
              )`,
            }}
          />

          {/* Texte optionnel */}
          {text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 0.9] }}
              transition={{ duration: duration / 1000, times: [0, 0.2, 0.6, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span
                className="text-4xl md:text-6xl font-bold tracking-widest"
                style={{
                  fontFamily: "'VT323', monospace",
                  color: "#00ff41",
                  textShadow: "0 0 20px #00ff41",
                }}
              >
                {text}
              </span>
            </motion.div>
          )}

          {/* Vignette d'effet CRT */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: duration / 1000, times: [0, 0.5, 1] }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.8) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface FlashTransitionProps {
  /** Afficher la transition */
  isActive: boolean;
  /** Callback quand la transition est terminée */
  onComplete?: () => void;
  /** Durée de la transition en ms */
  duration?: number;
}

/**
 * Variante simplifiée juste pour le flash blanc
 */
export function FlashTransition({
  isActive,
  onComplete,
  duration = 300,
}: FlashTransitionProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, ease: "easeOut" }}
          onAnimationComplete={onComplete}
          className="fixed inset-0 z-[100] pointer-events-none bg-white"
        />
      )}
    </AnimatePresence>
  );
}

export default SceneTransition;
