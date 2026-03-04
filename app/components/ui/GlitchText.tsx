"use client";

/**
 * @file GlitchText.tsx
 * @description Effet glitch CSS avec décalage RGB occasionnel
 * @author Agent 2 - UI Components
 */

import { motion, type Transition } from "framer-motion";

/**
 * Niveaux d'intensité du glitch
 */
export type GlitchIntensity = "low" | "medium" | "high";

/**
 * Configuration des intensités
 */
const INTENSITY_CONFIG: Record<GlitchIntensity, {
  duration: number;
  rgbOffset: number;
  skewAmount: number;
}> = {
  low: {
    duration: 3,
    rgbOffset: 2,
    skewAmount: 1,
  },
  medium: {
    duration: 1.5,
    rgbOffset: 4,
    skewAmount: 2,
  },
  high: {
    duration: 0.5,
    rgbOffset: 6,
    skewAmount: 4,
  },
};

/**
 * Props pour le composant GlitchText
 */
export interface GlitchTextProps {
  /** Texte à afficher avec effet glitch */
  text: string;
  /** Intensité de l'effet glitch */
  intensity?: GlitchIntensity;
  /** Couleur du texte */
  color?: string;
  /** Taille de police */
  fontSize?: string | number;
  /** Classe CSS additionnelle */
  className?: string;
  /** Activer l'animation au survol uniquement */
  hoverOnly?: boolean;
  /** Durée personnalisée de l'animation en secondes */
  customDuration?: number;
}

/**
 * Composant de texte avec effet glitch RGB
 * Décalage chromatique et distorsion pour effet d'erreur numérique
 * 
 * @example
 * ```tsx
 * <GlitchText 
 *   text="SYSTEM ERROR"
 *   intensity="high"
 *   color="#ff0000"
 *   fontSize={32}
 * />
 * ```
 */
export default function GlitchText({
  text,
  intensity = "medium",
  color = "#00ff41",
  fontSize = 24,
  className = "",
  hoverOnly = false,
  customDuration,
}: GlitchTextProps) {
  const config = INTENSITY_CONFIG[intensity];
  const duration = customDuration ?? config.duration;

  // Transition pour l'animation glitch
  const glitchTransition: Transition = {
    duration: duration,
    repeat: Infinity,
    repeatType: "reverse",
    ease: [0.4, 0, 0.2, 1],
    times: [0, 0.25, 0.5, 0.75, 1],
  };

  // Transition pour le hover
  const hoverTransition: Transition = {
    duration: 0.3,
    repeat: Infinity,
    ease: [0.4, 0, 0.2, 1],
  };

  // Animation pour le clip-path
  const clipTransition: Transition = {
    duration: duration * 0.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: [0.4, 0, 0.2, 1],
  };

  return (
    <motion.span
      className={`relative inline-block font-mono ${className}`}
      style={{
        fontFamily: "'VT323', monospace",
        fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
        color: color,
        letterSpacing: "0.05em",
      }}
      initial={{
        x: 0,
        skewX: 0,
        textShadow: `${config.rgbOffset}px 0 #ff00ff, -${config.rgbOffset}px 0 #00ffff`,
      }}
      animate={hoverOnly ? undefined : {
        x: [0, -2, 2, -1, 1, 0],
        skewX: [0, -config.skewAmount, config.skewAmount, 0],
        textShadow: [
          `${config.rgbOffset}px 0 #ff00ff, -${config.rgbOffset}px 0 #00ffff`,
          `-${config.rgbOffset}px 0 #ff00ff, ${config.rgbOffset}px 0 #00ffff`,
          `${config.rgbOffset}px 0 #ff00ff, -${config.rgbOffset}px 0 #00ffff`,
        ],
      }}
      whileHover={{
        x: [0, -3, 3, -2, 2, 0],
        skewX: [0, -3, 3, 0],
        textShadow: [
          `${config.rgbOffset + 2}px 0 #ff00ff, -${config.rgbOffset + 2}px 0 #00ffff`,
          `-${config.rgbOffset + 2}px 0 #ff00ff, ${config.rgbOffset + 2}px 0 #00ffff`,
          `${config.rgbOffset + 2}px 0 #ff00ff, -${config.rgbOffset + 2}px 0 #00ffff`,
        ],
      }}
      transition={hoverOnly ? hoverTransition : glitchTransition}
    >
      {/* Texte principal */}
      <span className="relative z-10">{text}</span>

      {/* Couche de glitch supplémentaire pour effet renforcé */}
      {!hoverOnly && intensity !== "low" && (
        <motion.span
          className="absolute inset-0 opacity-70"
          style={{ color: "#ff00ff", mixBlendMode: "screen" }}
          initial={{ clipPath: "inset(0 0 0 0)" }}
          animate={{
            clipPath: [
              "inset(0 0 0 0)",
              "inset(10% 0 60% 0)",
              "inset(40% 0 20% 0)",
              "inset(0 0 0 0)",
            ],
          }}
          transition={clipTransition}
        >
          {text}
        </motion.span>
      )}

      {/* Effet de ligne de scan glitch */}
      {intensity === "high" && (
        <motion.span
          className="absolute left-0 right-0 h-px bg-current opacity-50"
          style={{ backgroundColor: color }}
          animate={{
            top: ["0%", "100%", "50%", "0%"],
            opacity: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear",
            times: [0, 0.3, 0.6, 1],
          }}
        />
      )}
    </motion.span>
  );
}


