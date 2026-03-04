"use client";

/**
 * @file Scanlines.tsx
 * @description Overlay full-screen avec scanlines CSS animées pour effet CRT rétro
 * @author Agent 2 - UI Components
 */

import { motion } from "framer-motion";

/**
 * Props pour le composant Scanlines
 */
/**
 * Props pour le composant Scanlines
 */
export interface ScanlinesProps {
  /** Opacité des scanlines (0 à 1) */
  opacity?: number;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Overlay de scanlines pour effet CRT authentique
 * Position fixed, pointer-events-none pour ne pas interférer avec les interactions
 * 
 * @example
 * ```tsx
 * <Scanlines opacity={0.15} />
 * ```
 */
export default function Scanlines({ 
  opacity = 0.15, 
  className = "" 
}: ScanlinesProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          rgba(0, 0, 0, ${opacity}),
          rgba(0, 0, 0, ${opacity}) 1px,
          transparent 1px,
          transparent 2px
        )`,
      }}
      aria-hidden="true"
    />
  );
}
