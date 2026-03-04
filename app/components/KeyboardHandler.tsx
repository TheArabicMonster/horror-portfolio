"use client";

/**
 * @file KeyboardHandler.tsx
 * @description Gestionnaire global des raccourcis clavier
 * @author Agent 6 - Routing & State Management
 * 
 * Raccourcis:
 * - ESC: ferme MediaViewer ou retourne au hub
 * - Flèches gauche/droite: navigation médias dans viewer
 * - WASD: déplacement (optionnel, pour futur mode PointerLock)
 * - G: toggle glitch mode
 */

import { useEffect, useCallback } from "react";
import { useAppContext } from "@/app/context/AppContext";
import { useOptionalAudioContext } from "@/app/context/AudioContext";

/**
 * Composant invisible qui gère les raccourcis clavier globaux
 * À placer dans le layout pour couvrir toute l'application
 */
export function KeyboardHandler() {
  const {
    state,
    closeMedia,
    closeGallery,
    nextMedia,
    prevMedia,
    setGlitchMode,
  } = useAppContext();
  
  const audioContext = useOptionalAudioContext();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignorer les touches si on est dans un input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "Escape":
        case "Esc":
          e.preventDefault();
          if (state.selectedMedia) {
            closeMedia();
            audioContext?.playBeep?.();
          } else if (state.currentView === "gallery") {
            closeGallery();
            audioContext?.playBeep?.();
          }
          break;

        case "ArrowRight":
          if (state.selectedMedia) {
            e.preventDefault();
            nextMedia();
            audioContext?.playHoverBeep?.();
          }
          break;

        case "ArrowLeft":
          if (state.selectedMedia) {
            e.preventDefault();
            prevMedia();
            audioContext?.playHoverBeep?.();
          }
          break;

        case "g":
        case "G":
          // Toggle glitch mode
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setGlitchMode();
            audioContext?.playGlitch?.();
          }
          break;

        case "m":
        case "M":
          // Toggle mute
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            audioContext?.toggleMute?.();
          }
          break;

        // WASD - réservé pour futur mode PointerLock
        case "w":
        case "W":
        case "a":
        case "A":
        case "s":
        case "S":
        case "d":
        case "D":
          // Pour l'instant, on ignore - sera utilisé pour déplacement 3D
          break;
      }
    },
    [
      state.selectedMedia,
      state.currentView,
      closeMedia,
      closeGallery,
      nextMedia,
      prevMedia,
      setGlitchMode,
      audioContext,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Ce composant ne rend rien
  return null;
}

/**
 * Hook personnalisé pour gérer les touches dans un composant spécifique
 */
export function useKeyboardHandler(
  handlers: {
    onEscape?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onEnter?: () => void;
  },
  deps: React.DependencyList = []
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
        case "Esc":
          handlers.onEscape?.();
          break;
        case "ArrowLeft":
          handlers.onArrowLeft?.();
          break;
        case "ArrowRight":
          handlers.onArrowRight?.();
          break;
        case "Enter":
          handlers.onEnter?.();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handlers.onEscape, handlers.onArrowLeft, handlers.onArrowRight, handlers.onEnter, ...deps]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export default KeyboardHandler;
