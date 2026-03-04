"use client";

import React from "react";

/**
 * @file KonamiCode.tsx
 * @description Détecteur de code Konami (↑↑↓↓←→←→BA) pour activer le mode debug
 * @author Agent 7 - Easter Eggs
 * 
 * Easter Egg #1: Konami Code
 * - Séquence: ↑ ↑ ↓ ↓ ← → ← → B A
 * - Active le mode debug avec wireframe et stats
 * - Stocké dans sessionStorage pour persistance pendant la session
 */

import { useState, useEffect, useCallback } from "react";

// Séquence du code Konami (arrow keys + B + A)
const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Hook personnalisé pour détecter le code Konami
 * @returns Object avec l'état debug et la fonction pour l'activer manuellement
 */
export function useKonamiCode(): {
  isDebugMode: boolean;
  activateDebug: () => void;
  deactivateDebug: () => void;
} {
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Vérifie si le code Konami a été entré au complet
  useEffect(() => {
    if (keySequence.length === KONAMI_SEQUENCE.length) {
      const isMatch = keySequence.every(
        (key, index) => key.toLowerCase() === KONAMI_SEQUENCE[index].toLowerCase()
      );
      
      if (isMatch) {
        setIsDebugMode(true);
        // Stocke dans sessionStorage pour persistance
        try {
          sessionStorage.setItem("horror-debug-mode", "true");
        } catch {
          // Ignorer les erreurs sessionStorage
        }
        // Joue un son de confirmation si disponible
        if (typeof window !== "undefined" && (window as unknown as { playDebugSound?: () => void }).playDebugSound) {
          (window as unknown as { playDebugSound: () => void }).playDebugSound();
        }
      }
      
      // Réinitialise la séquence après vérification
      setKeySequence([]);
    }
  }, [keySequence]);

  // Gestionnaire de touches
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore les touches si un input est focus
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    setKeySequence((prev) => {
      const newSequence = [...prev, event.key];
      // Garde seulement les N dernières touches (N = longueur du code)
      if (newSequence.length > KONAMI_SEQUENCE.length) {
        return newSequence.slice(-KONAMI_SEQUENCE.length);
      }
      return newSequence;
    });
  }, []);

  // Restaure l'état debug depuis sessionStorage au montage
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const saved = sessionStorage.getItem("horror-debug-mode");
      if (saved === "true") {
        setIsDebugMode(true);
      }
      
      // Vérifie aussi l'URL pour ?debug=true
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("debug") === "true") {
        setIsDebugMode(true);
        sessionStorage.setItem("horror-debug-mode", "true");
      }
    } catch {
      // Ignorer les erreurs
    }
  }, []);

  // Ajoute l'écouteur d'événements
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const activateDebug = useCallback(() => {
    setIsDebugMode(true);
    try {
      sessionStorage.setItem("horror-debug-mode", "true");
    } catch {
      // Ignorer
    }
  }, []);

  const deactivateDebug = useCallback(() => {
    setIsDebugMode(false);
    try {
      sessionStorage.removeItem("horror-debug-mode");
    } catch {
      // Ignorer
    }
  }, []);

  return { isDebugMode, activateDebug, deactivateDebug };
}

/**
 * Composant d'affichage "DEBUG MODE" quand actif
 */
export function DebugModeIndicator(): React.JSX.Element | null {
  const { isDebugMode } = useKonamiCode();
  
  if (!isDebugMode) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="bg-red-600 text-white text-center py-1 font-mono text-sm font-bold animate-pulse">
        ⚠ DEBUG MODE ACTIVÉ ⚠
      </div>
    </div>
  );
}

export default DebugModeIndicator;
