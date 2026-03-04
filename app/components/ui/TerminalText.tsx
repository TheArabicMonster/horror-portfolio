"use client";

/**
 * @file TerminalText.tsx
 * @description Animation typewriter lettre par lettre avec curseur clignotant
 * @author Agent 2 - UI Components
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * Couleurs disponibles pour le terminal
 */
export type TerminalColor = "terminal" | "amber" | "blood";

/**
 * Configuration des couleurs
 */
const COLOR_MAP: Record<TerminalColor, { text: string; shadow: string }> = {
  terminal: { text: "#00ff41", shadow: "0 0 10px #00ff41" },
  amber: { text: "#ffb000", shadow: "0 0 10px #ffb000" },
  blood: { text: "#8b0000", shadow: "0 0 10px #8b0000" },
};

/**
 * Props pour le composant TerminalText
 */
export interface TerminalTextProps {
  /** Texte à afficher avec animation typewriter */
  text: string;
  /** Vitesse de frappe en ms (défaut: 50) */
  speed?: number;
  /** Couleur du texte terminal */
  color?: TerminalColor;
  /** Taille de police en pixels */
  fontSize?: number;
  /** Délai avant démarrage de l'animation en ms */
  delay?: number;
  /** Callback appelé quand l'animation est terminée */
  onComplete?: () => void;
  /** Afficher le curseur clignotant */
  showCursor?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Démarrer l'animation automatiquement */
  autoStart?: boolean;
}

/**
 * Composant de texte terminal avec animation typewriter
 * Affiche le texte lettre par lettre avec un curseur clignotant à la fin
 * 
 * @example
 * ```tsx
 * <TerminalText 
 *   text="SYSTEM INITIALIZED..."
 *   speed={40}
 *   color="terminal"
 *   onComplete={() => console.log('Done!')}
 * />
 * ```
 */
export default function TerminalText({
  text,
  speed = 50,
  color = "terminal",
  fontSize = 20,
  delay = 0,
  onComplete,
  showCursor = true,
  className = "",
  autoStart = true,
}: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const colorStyle = COLOR_MAP[color];

  const startTyping = useCallback(() => {
    setHasStarted(true);
  }, []);

  // Démarrage avec délai
  useEffect(() => {
    if (!autoStart) return;
    
    const delayTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [delay, autoStart]);

  // Animation typewriter
  useEffect(() => {
    if (!hasStarted) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete, hasStarted]);

  // Reset quand le texte change
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`font-mono inline-block ${className}`}
      style={{
        fontFamily: "'VT323', monospace",
        fontSize: `${fontSize}px`,
        color: colorStyle.text,
        textShadow: colorStyle.shadow,
        lineHeight: 1.4,
        letterSpacing: "0.05em",
      }}
    >
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: [0.4, 0, 0.6, 1],
          }}
          style={{
            color: colorStyle.text,
          }}
        >
          _
        </motion.span>
      )}
    </motion.span>
  );
}


