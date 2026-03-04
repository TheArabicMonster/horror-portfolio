"use client";

/**
 * @file AudioToggle.tsx
 * @description Bouton mute/unmute style Win95 en haut à droite
 * @author Agent 5 - Audio & Atmosphere
 * 
 * Position: fixed top-4 right-4
 * Style: bouton carré gris rétro Windows 95
 * z-50 pour rester au-dessus de tout
 */

import React, { useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudioContext } from "@/app/context/AudioContext";

/**
 * Props du composant AudioToggle
 */
export interface AudioToggleProps {
  /** Classe CSS additionnelle */
  className?: string;
  /** Position personnalisée (défaut: top-4 right-4) */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

/**
 * Bouton de contrôle audio mute/unmute
 * 
 * Style rétro Windows 95:
 * - Bouton carré avec bords en relief
 * - Couleur grise par défaut
 * - Effet enfoncé au clic
 * - Tooltip "MUTE / UNMUTE"
 * 
 * @example
 * ```tsx
 * // Utilisation simple
 * <AudioToggle />
 * 
 * // Avec position personnalisée
 * <AudioToggle position="bottom-right" />
 * ```
 */
export default function AudioToggle({
  className = "",
  position = "top-right",
}: AudioToggleProps) {
  const { muted, toggleMute, hasInteracted } = useAudioContext();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Déterminer la position
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  /**
   * Gère le clic sur le bouton
   */
  const handleClick = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  /**
   * Gère l'appui sur la touche (accessibilité)
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMute();
    }
  }, [toggleMute]);

  // Ne pas afficher si l'utilisateur n'a pas encore interagi
  // (l'audio n'est pas encore initialisé)
  if (!hasInteracted) {
    return null;
  }

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black border border-[#808080] text-white text-xs font-mono whitespace-nowrap shadow-lg">
          <span className="text-[#c0c0c0]">
            {muted ? "UNMUTE" : "MUTE"}
          </span>
          {/* Flèche du tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
        </div>
      )}

      {/* Bouton style Win95 */}
      <button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        onKeyDown={handleKeyDown}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        aria-pressed={muted}
        className={`
          relative w-10 h-10 
          flex items-center justify-center
          bg-[#c0c0c0]
          border-2
          ${isPressed 
            ? "border-[#404040] border-r-[#ffffff] border-b-[#ffffff]" 
            : "border-[#ffffff] border-r-[#404040] border-b-[#404040]"
          }
          active:border-[#404040] active:border-r-[#ffffff] active:border-b-[#ffffff]
          focus:outline-none
          focus:ring-2 focus:ring-[#00ff41] focus:ring-offset-2 focus:ring-offset-black
          transition-none
        `}
        style={{
          // Ombre intérieure pour effet 3D Win95
          boxShadow: isPressed 
            ? "inset 1px 1px 2px rgba(0,0,0,0.5)" 
            : "none",
        }}
      >
        {/* Icône */}
        <span className={`
          ${muted ? "text-[#808080]" : "text-black"}
          transition-colors duration-100
        `}>
          {muted ? (
            <VolumeX size={18} strokeWidth={2} />
          ) : (
            <Volume2 size={18} strokeWidth={2} />
          )}
        </span>

        {/* Indicateur LED (petit point vert si audio actif) */}
        {!muted && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00ff41] rounded-full animate-pulse" />
        )}
      </button>

      {/* Label sous le bouton */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1">
        <span className="text-[10px] font-mono text-[#808080] uppercase tracking-wider">
          {muted ? "OFF" : "ON"}
        </span>
      </div>
    </div>
  );
}

/**
 * Export nommé pour import alternatif
 */
export { AudioToggle };
