"use client";

/**
 * @file BootSequence.tsx
 * @description Séquence de démarrage BIOS style avec lignes progressives et barre de chargement
 * @author Agent 2 - UI Components
 * 
 * INTÉGRATION AUDIO (Agent 5):
 * - Appelle enableAudio() lors du clic sur "ENTER SYSTEM"
 * - Démarre l'ambiance sonore après interaction utilisateur
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TerminalText from "./TerminalText";
import { useOptionalAudioContext } from "@/app/context/AudioContext";

/**
 * Props pour le composant BootSequence
 */
/**
 * Props pour le composant BootSequence
 */
export interface BootSequenceProps {
  /** Callback appelé quand la séquence est terminée */
  onComplete: () => void;
  /** Délai entre chaque ligne en ms */
  lineDelay?: number;
  /** Activer le son de boot (si implémenté) */
  soundEnabled?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Textes de boot personnalisés */
  customLines?: string[];
}

/**
 * Lignes de boot par défaut style BIOS vintage
 */
const DEFAULT_BOOT_LINES = [
  "BIOS DATE 01/01/99 14:22:51 VER 1.02",
  "CPU: NEC V60, SPEED: 16 MHz",
  "CPU ID: 0x0524",
  "",
  "640K RAM SYSTEM... OK",
  "VIDEO ADAPTER... OK",
  "VGA BIOS... OK",
  "",
  "FIXED DISK 0: 210MB... OK",
  "FIXED DISK 1: NONE",
  "",
  "KEYBOARD... OK",
  "MOUSE... OK",
  "SERIAL PORTS... OK",
  "PARALLEL PORT... OK",
  "",
  "CHECKING NVRAM... OK",
  "LOADING ASSETS...",
];

/**
 * Composant de séquence de démarrage BIOS style
 * Affiche des lignes de texte progressivement avec une barre de chargement
 * et un bouton ENTER SYSTEM clignotant à la fin
 * 
 * @example
 * ```tsx
 * <BootSequence 
 *   onComplete={() => setBootComplete(true)}
 *   lineDelay={300}
 * />
 * ```
 */
export default function BootSequence({
  onComplete,
  lineDelay = 250,
  className = "",
  customLines,
}: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [showLoadingBar, setShowLoadingBar] = useState<boolean>(false);
  const [showEnterButton, setShowEnterButton] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const bootLines = customLines ?? DEFAULT_BOOT_LINES;
  
  // Accès au contexte audio (optionnel pour éviter les erreurs si provider absent)
  const audioContext = useOptionalAudioContext();

  // Affichage progressif des lignes
  useEffect(() => {
    if (visibleLines < bootLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1);
      }, lineDelay);
      return () => clearTimeout(timer);
    } else {
      // Toutes les lignes sont affichées, démarrer la barre de chargement
      setShowLoadingBar(true);
    }
  }, [visibleLines, bootLines.length, lineDelay]);

 // Progression de la barre de chargement
  useEffect(() => {
    if (!showLoadingBar) return;

    if (loadingProgress < 100) {
      // Progression aléatoire pour effet réaliste
      const increment = Math.random() * 15 + 5;
      const delay = Math.random() * 200 + 100;

      const timer = setTimeout(() => {
        setLoadingProgress((prev) => Math.min(prev + increment, 100));
      }, delay);

      return () => clearTimeout(timer);
    } else {
      // Chargement terminé, afficher le bouton
      const timer = setTimeout(() => {
        setShowEnterButton(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showLoadingBar, loadingProgress]);

  // Gestion du clic sur le bouton ENTER
  const handleEnter = useCallback(() => {
    // Activer l'audio après interaction utilisateur (obligatoire pour les navigateurs)
    if (audioContext) {
      audioContext.enableAudio();
      // Démarrer l'ambiance sonore immersive
      audioContext.startAmbience();
    }
    
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [onComplete, audioContext]);

  // Gestion du clavier (touche Entrée)
  useEffect(() => {
    if (!showEnterButton) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleEnter();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEnterButton, handleEnter]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 bg-black flex flex-col items-center justify-center p-8 ${className}`}
      style={{ fontFamily: "'VT323', monospace" }}
    >
      <div className="w-full max-w-2xl">
        {/* Logo/Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 text-center"
        >
          <pre className="text-[#00ff41] text-xs md:text-sm leading-tight">
            {`
██╗  ██╗ ██████╗ ██████╗ ██████╗  ██████╗ ██████╗ 
██║  ██║██╔═══██╗██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
███████║██║   ██║██████╔╝██████╔╝██║   ██║██████╔╝
██╔══██║██║   ██║██╔══██╗██╔══██╗██║   ██║██╔══██╗
██║  ██║╚██████╔╝██║  ██║██║  ██║╚██████╔╝██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝
            `}
          </pre>
        </motion.div>

        {/* Zone de boot */}
        <div className="bg-black border-2 border-[#00ff41] p-6 shadow-[0_0_20px_rgba(0,255,65,0.2)]">
          {/* Lignes de boot */}
          <div className="space-y-1 mb-6 min-h-[300px]">
            <AnimatePresence>
              {bootLines.slice(0, visibleLines).map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className="text-[#00ff41] text-lg md:text-xl"
                  style={{ textShadow: "0 0 5px #00ff41" }}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Barre de chargement */}
            {showLoadingBar && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#00ff41] text-lg" style={{ textShadow: "0 0 5px #00ff41" }}>
                    {loadingProgress < 100
                      ? `[${"█".repeat(Math.floor(loadingProgress / 10))}${"░".repeat(
                          10 - Math.floor(loadingProgress / 10)
                        )}] ${Math.floor(loadingProgress)}%`
                      : "[██████████] 100%"}
                  </span>
                  {loadingProgress < 100 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                      className="text-[#00ff41]"
                    >
                      _
                    </motion.span>
                  )}
                </div>

                {loadingProgress >= 100 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#00ff41] mt-2"
                    style={{ textShadow: "0 0 5px #00ff41" }}
                  >
                    SYSTEM READY.
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Bouton ENTER SYSTEM */}
          <AnimatePresence>
            {showEnterButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex justify-center"
              >
                <button
                  onClick={handleEnter}
                  className="group relative px-8 py-3 bg-transparent border-2 border-[#00ff41] text-[#00ff41] text-xl font-bold transition-all duration-100 hover:bg-[#00ff41] hover:text-black focus:outline-none"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    [ ENTER SYSTEM ]
                  </motion.span>
                  
                  {/* Effet de glow au survol */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[0_0_20px_rgba(0,255,65,0.5)]" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showEnterButton ? 1 : 0.5 }}
          className="mt-4 text-center text-[#00ff41] text-sm opacity-50"
        >
          Press ENTER to continue
        </motion.div>
      </div>
    </motion.div>
  );
}

