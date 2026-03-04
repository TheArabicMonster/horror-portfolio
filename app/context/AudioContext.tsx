"use client";

/**
 * @file AudioContext.tsx
 * @description Context React global pour l'audio immersif FNAF-style
 * @author Agent 5 - Audio & Atmosphere
 * 
 * Ce contexte fournit:
 * - Audio démarrant UNIQUEMENT après clic "ENTER SYSTEM"
 * - Volume par défaut: 20%
 * - Pas d'autoplay automatique (bloqué par navigateurs)
 * - Persistance des préférences dans localStorage
 */

import React, {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useAudio, AudioEffect } from "@/app/hooks/useAudio";

/**
 * Interface du contexte audio
 */
interface AudioContextType {
  /** Audio activé globalement */
  audioEnabled: boolean;
  /** Volume actuel (0-1) */
  volume: number;
  /** Mode muet activé */
  muted: boolean;
  /** L'utilisateur a-t-il interagi avec la page */
  hasInteracted: boolean;
  
  // Actions
  /** Activer/désactiver l'audio */
  toggleAudio: () => void;
  /** Activer/désactiver le mute */
  toggleMute: () => void;
  /** Définir le volume (0-1) */
  setVolume: (level: number) => void;
  /** Activer l'audio après interaction (appelé par BootSequence) */
  enableAudio: () => void;
  
  // Effets sonores
  /** Jouer un effet sonore générique */
  playEffect: (effect: AudioEffect) => void;
  /** Jouer un bip terminal (UI) */
  playBeep: () => void;
  /** Jouer un grincement de porte */
  playDoorCreak: () => void;
  /** Jouer un effet glitch */
  playGlitch: () => void;
  /** Jouer un bip hover */
  playHoverBeep: () => void;
  
  // Ambiance
  /** Démarrer l'ambiance de fond (hum + buzz aléatoires) */
  startAmbience: () => void;
  /** Arrêter l'ambiance de fond */
  stopAmbience: () => void;
  /** Arrêter tous les sons */
  stopAll: () => void;
}

// Création du contexte avec valeur par défaut undefined
const AudioContext = createContext<AudioContextType | undefined>(undefined);

/**
 * Props du provider AudioProvider
 */
interface AudioProviderProps {
  children: ReactNode;
}

/**
 * Provider pour l'audio global
 * 
 * À placer au niveau du root layout pour que l'audio soit accessible partout.
 * Le son ne démarre qu'après appel explicite de enableAudio() (par exemple après
 * le clic sur "ENTER SYSTEM" dans BootSequence).
 * 
 * @example
 * ```tsx
 * // layout.tsx
 * <AudioProvider>
 *   {children}
 * </AudioProvider>
 * ```
 */
export function AudioProvider({ children }: AudioProviderProps) {
  const {
    enabled,
    volume,
    muted,
    hasInteracted,
    toggleAudio,
    toggleMute,
    setVolume,
    enableAudio,
    playEffect,
    playTerminalBeep,
    playDoorCreak,
    playRareGlitch,
    playHoverBeep,
    startAmbience,
    stopAmbience,
    stopAll,
  } = useAudio();

  // Wrappers pour exposer une API cohérente
  const handleToggleAudio = useCallback(() => {
    toggleAudio();
  }, [toggleAudio]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
  }, [toggleMute]);

  const handleSetVolume = useCallback((level: number) => {
    setVolume(level);
  }, [setVolume]);

  const handleEnableAudio = useCallback(() => {
    enableAudio();
  }, [enableAudio]);

  const handlePlayEffect = useCallback((effect: AudioEffect) => {
    playEffect(effect);
  }, [playEffect]);

  const handlePlayBeep = useCallback(() => {
    playTerminalBeep();
  }, [playTerminalBeep]);

  const handlePlayDoorCreak = useCallback(() => {
    playDoorCreak();
  }, [playDoorCreak]);

  const handlePlayGlitch = useCallback(() => {
    playRareGlitch();
  }, [playRareGlitch]);

  const handlePlayHoverBeep = useCallback(() => {
    playHoverBeep();
  }, [playHoverBeep]);

  const handleStartAmbience = useCallback(() => {
    startAmbience();
  }, [startAmbience]);

  const handleStopAmbience = useCallback(() => {
    stopAmbience();
  }, [stopAmbience]);

  const handleStopAll = useCallback(() => {
    stopAll();
  }, [stopAll]);

  const value: AudioContextType = {
    // État
    audioEnabled: enabled,
    volume,
    muted,
    hasInteracted,
    
    // Actions globales
    toggleAudio: handleToggleAudio,
    toggleMute: handleToggleMute,
    setVolume: handleSetVolume,
    enableAudio: handleEnableAudio,
    
    // Effets
    playEffect: handlePlayEffect,
    playBeep: handlePlayBeep,
    playDoorCreak: handlePlayDoorCreak,
    playGlitch: handlePlayGlitch,
    playHoverBeep: handlePlayHoverBeep,
    
    // Ambiance
    startAmbience: handleStartAmbience,
    stopAmbience: handleStopAmbience,
    stopAll: handleStopAll,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte audio
 * 
 * @throws {Error} Si utilisé en dehors d'un AudioProvider
 * 
 * @example
 * ```tsx
 * const { 
 *   audioEnabled, 
 *   toggleMute, 
 *   playDoorCreak 
 * } = useAudioContext();
 * ```
 */
export function useAudioContext(): AudioContextType {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error(
      "useAudioContext doit être utilisé à l'intérieur d'un AudioProvider"
    );
  }
  return context;
}

/**
 * Hook sécurisé qui retourne undefined si hors du provider
 * 
 * Utile pour les composants qui peuvent être utilisés sans audio
 * ou pour des vérifications conditionnelles.
 * 
 * @example
 * ```tsx
 * const audio = useOptionalAudioContext();
 * if (audio) {
 *   audio.playBeep();
 * }
 * ```
 */
export function useOptionalAudioContext(): AudioContextType | undefined {
  return useContext(AudioContext);
}

export default AudioContext;
