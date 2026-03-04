"use client";

/**
 * @file CRTOverlay.tsx
 * @description Effet vignette + courbure d'écran pour simulation CRT authentique
 * @author Agent 2 - UI Components
 */

import { motion } from "framer-motion";

/**
 * Props pour le composant CRTOverlay
 */
/**
 * Props pour le composant CRTOverlay
 */
export interface CRTOverlayProps {
  /** Intensité de la vignette (0 à 1) */
  vignetteIntensity?: number;
  /** Intensité de la courbure (0 à 1) */
  curvatureIntensity?: number;
  /** Activer l'effet de flicker CRT */
  flicker?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Overlay CRT complet avec vignette, courbure et flicker optionnel
 * Combine plusieurs effets pour simuler un moniteur à tube cathodique
 * 
 * @example
 * ```tsx
 * <CRTOverlay 
 *   vignetteIntensity={0.4}
 *   curvatureIntensity={0.3}
 *   flicker={true}
 * />
 * ```
 */
export default function CRTOverlay({
  vignetteIntensity = 0.4,
  curvatureIntensity = 0.3,
  flicker = true,
  className = "",
}: CRTOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.2 }}
      className={`fixed inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Vignette radiale */}
      <div
        className="absolute inset-0 z-40"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(0, 0, 0, ${vignetteIntensity}) 100%
          )`,
          boxShadow: `inset 0 0 150px rgba(0, 0, 0, ${vignetteIntensity + 0.2})`,
        }}
      />

      {/* Effet de courbure d'écran */}
      <div
        className="absolute inset-0 z-45"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(0, 0, 0, ${curvatureIntensity}) 0%,
              transparent 8%,
              transparent 92%,
              rgba(0, 0, 0, ${curvatureIntensity}) 100%
            ),
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, ${curvatureIntensity}) 0%,
              transparent 8%,
              transparent 92%,
              rgba(0, 0, 0, ${curvatureIntensity}) 100%
            )
          `,
        }}
      />

      {/* Flicker CRT subtil */}
      {flicker && (
        <motion.div
          className="absolute inset-0 z-50 mix-blend-overlay"
          animate={{
            opacity: [0.97, 0.95, 0.98, 0.96, 0.99, 0.94, 0.97],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
          }}
          style={{
            background: "rgba(255, 255, 255, 0.02)",
          }}
        />
      )}

      {/* Ligne de scan mobile */}
      <motion.div
        className="absolute left-0 right-0 h-1 z-55"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(0, 255, 65, 0.08), transparent)",
          boxShadow: "0 0 10px rgba(0, 255, 65, 0.2)",
        }}
        animate={{
          top: ["-5%", "105%"],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}
