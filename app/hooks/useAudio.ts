"use client";

/**
 * @file useAudio.ts
 * @description Hook complet de gestion audio avec Howler.js
 * @author Agent 5 - Audio & Atmosphere
 * 
 * Système audio immersif style FNAF avec:
 * - Bourdonnement électrique constant (backgroundHum)
 * - Buzz intermittent néon (neonBuzz)
 * - Bips UI courts (terminalBeep)
 * - Grincement porte métal (doorCreak)
 * - Bruitage glitch rare (rareGlitch)
 * - Bip hover écran (hoverBeep)
 * - Clic mécanique (mechanicalClick)
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Howl, Howler } from "howler";
import { soundUrls, soundConfig, SoundKey } from "@/app/lib/sounds";

/**
 * État de l'audio
 */
interface AudioState {
  /** Audio activé globalement */
  enabled: boolean;
  /** Volume global (0-1) */
  volume: number;
  /** Mode muet */
  muted: boolean;
  /** L'utilisateur a interagi avec la page (nécessaire pour débloquer l'audio) */
  hasInteracted: boolean;
}

/**
 * Type des effets sonores disponibles
 */
export type AudioEffect = SoundKey;

/**
 * Interface de retour du hook useAudio
 */
interface UseAudioReturn extends AudioState {
  /** Activer/désactiver l'audio */
  toggleAudio: () => void;
  /** Activer/désactiver le mute */
  toggleMute: () => void;
  /** Définir le volume (0-1) */
  setVolume: (level: number) => void;
  /** Jouer un effet sonore */
  playEffect: (effect: AudioEffect) => void;
  /** Jouer le bourdonnement de fond */
  playBackgroundHum: () => void;
  /** Jouer un buzz néon */
  playNeonBuzz: () => void;
  /** Jouer un bip terminal */
  playTerminalBeep: () => void;
  /** Jouer un grincement de porte */
  playDoorCreak: () => void;
  /** Jouer un glitch rare */
  playRareGlitch: () => void;
  /** Jouer un bip hover */
  playHoverBeep: () => void;
  /** Jouer un clic mécanique */
  playMechanicalClick: () => void;
  /** Démarrer l'ambiance complète (hum + buzz aléatoires) */
  startAmbience: () => void;
  /** Arrêter l'ambiance de fond */
  stopAmbience: () => void;
  /** Arrêter tous les sons */
  stopAll: () => void;
  /** Marquer que l'utilisateur a interagi (appelé après clic "ENTER SYSTEM") */
  enableAudio: () => void;
}

/**
 * Hook complet de gestion audio avec Howler.js
 * 
 * @example
 * ```tsx
 * const {
 *   enabled,
 *   volume,
 *   muted,
 *   toggleMute,
 *   setVolume,
 *   playDoorCreak,
 *   enableAudio,
 * } = useAudio();
 * 
 * // Après interaction utilisateur
 * enableAudio();
 * 
 * // Jouer un son
 * playDoorCreak();
 * ```
 */
export function useAudio(): UseAudioReturn {
  // État global de l'audio
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolumeState] = useState(0.2); // 20% par défaut
  const [muted, setMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Références Howl pour chaque son
  const howlsRef = useRef<Record<SoundKey, Howl | null>>({
    backgroundHum: null,
    neonBuzz: null,
    terminalBeep: null,
    doorCreak: null,
    rareGlitch: null,
    hoverBeep: null,
    mechanicalClick: null,
  });

  // Timer pour le buzz aléatoire
  const buzzTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAmbienceActiveRef = useRef(false);

  /**
   * Initialise les instances Howl (lazy loading)
   */
  const getHowl = useCallback((key: SoundKey): Howl => {
    if (!howlsRef.current[key]) {
      const config = soundConfig[key];
      howlsRef.current[key] = new Howl({
        src: [soundUrls[key]],
        loop: config.loop,
        volume: config.volume * volume,
        rate: config.rate,
        html5: false, // Force Web Audio API pour meilleure performance
        preload: true,
        onloaderror: (_id, error) => {
          console.warn(`[Audio] Erreur chargement ${key}:`, error);
        },
        onplayerror: (_id, error) => {
          console.warn(`[Audio] Erreur lecture ${key}:`, error);
          // Tentative de reprise après interaction
          howlsRef.current[key]?.once("unlock", () => {
            howlsRef.current[key]?.play();
          });
        },
      });
    }
    return howlsRef.current[key]!;
  }, [volume]);

  /**
   * Charge les préférences depuis localStorage au montage
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedEnabled = localStorage.getItem("horror-audio-enabled");
      const savedVolume = localStorage.getItem("horror-audio-volume");
      const savedMuted = localStorage.getItem("horror-audio-muted");

      if (savedEnabled !== null) {
        setEnabled(savedEnabled === "true");
      }
      if (savedVolume !== null) {
        const parsed = parseFloat(savedVolume);
        setVolumeState(Math.max(0, Math.min(1, parsed)));
      }
      if (savedMuted !== null) {
        setMuted(savedMuted === "true");
      }
    } catch {
      // Ignorer les erreurs localStorage (mode privé, etc.)
    }
  }, []);

  /**
   * Sauvegarde les préférences quand elles changent
   */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("horror-audio-enabled", String(enabled));
    } catch {
      // Ignorer
    }
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("horror-audio-volume", String(volume));
    } catch {
      // Ignorer
    }
  }, [volume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("horror-audio-muted", String(muted));
    } catch {
      // Ignorer
    }
  }, [muted]);

  /**
   * Met à jour le volume global de Howler quand le volume ou mute change
   */
  useEffect(() => {
    Howler.volume(muted ? 0 : volume);
  }, [volume, muted]);

  /**
   * Active l'audio après interaction utilisateur
   * Doit être appelé après un clic explicite (ex: "ENTER SYSTEM")
   */
  const enableAudio = useCallback(() => {
    setHasInteracted(true);
    setEnabled(true);
    
    try {
      // Débloquer le contexte audio du navigateur
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
    } catch {
      // Ignorer les erreurs
    }
  }, []);

  /**
   * Active/désactive l'audio globalement
   */
  const toggleAudio = useCallback(() => {
    setEnabled((prev) => {
      const newValue = !prev;
      if (newValue && hasInteracted) {
        Howler.mute(false);
      }
      return newValue;
    });
  }, [hasInteracted]);

  /**
   * Active/désactive le mode muet
   */
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const newMuted = !prev;
      Howler.mute(newMuted);
      return newMuted;
    });
  }, []);

  /**
   * Définit le volume global (0-1)
   */
  const setVolume = useCallback((level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    setVolumeState(clamped);
    Howler.volume(muted ? 0 : clamped);
  }, [muted]);

  /**
   * Joue un effet sonore générique
   */
  const playEffect = useCallback((effect: AudioEffect) => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl(effect);
      if (howl && !howl.playing()) {
        howl.play();
      }
    } catch (error) {
      console.warn(`[Audio] Erreur lecture ${effect}:`, error);
    }
  }, [enabled, hasInteracted, getHowl]);

  /**
   * Joue le bourdonnement électrique de fond (loop)
   */
  const playBackgroundHum = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("backgroundHum");
      if (howl && !howl.playing()) {
        howl.loop(true);
        howl.volume(soundConfig.backgroundHum.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur backgroundHum:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Joue un buzz néon court
   */
  const playNeonBuzz = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("neonBuzz");
      if (howl) {
        // Variation aléatoire de pitch pour plus de réalisme
        howl.rate(0.9 + Math.random() * 0.2);
        howl.volume(soundConfig.neonBuzz.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur neonBuzz:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Joue un bip terminal court
   */
  const playTerminalBeep = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("terminalBeep");
      if (howl) {
        howl.volume(soundConfig.terminalBeep.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur terminalBeep:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Joue un grincement de porte métallique
   */
  const playDoorCreak = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("doorCreak");
      if (howl) {
        // Variation aléatoire pour éviter la répétition
        howl.rate(0.85 + Math.random() * 0.3);
        howl.volume(soundConfig.doorCreak.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur doorCreak:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Joue un effet glitch rare
   */
  const playRareGlitch = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("rareGlitch");
      if (howl) {
        howl.volume(soundConfig.rareGlitch.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur rareGlitch:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Joue un bip hover écran
   */
  const playHoverBeep = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("hoverBeep");
      if (howl) {
        howl.volume(soundConfig.hoverBeep.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur hoverBeep:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Joue un clic mécanique
   */
  const playMechanicalClick = useCallback(() => {
    if (!enabled || !hasInteracted) return;

    try {
      const howl = getHowl("mechanicalClick");
      if (howl) {
        howl.volume(soundConfig.mechanicalClick.volume * volume);
        howl.play();
      }
    } catch (error) {
      console.warn("[Audio] Erreur mechanicalClick:", error);
    }
  }, [enabled, hasInteracted, getHowl, volume]);

  /**
   * Démarre l'ambiance complète:
   * - Bourdonnement constant
   * - Buzz néon aléatoire toutes les 2-8 secondes
   */
  const startAmbience = useCallback(() => {
    if (!enabled || !hasInteracted || isAmbienceActiveRef.current) return;

    isAmbienceActiveRef.current = true;
    
    // Démarrer le bourdonnement
    playBackgroundHum();

    // Programmer les buzz aléatoires
    const scheduleNextBuzz = () => {
      if (!isAmbienceActiveRef.current) return;
      
      const delay = 2000 + Math.random() * 6000; // 2-8 secondes
      buzzTimerRef.current = setTimeout(() => {
        if (Math.random() > 0.3) { // 70% de chance de jouer
          playNeonBuzz();
        }
        scheduleNextBuzz();
      }, delay);
    };

    scheduleNextBuzz();
  }, [enabled, hasInteracted, playBackgroundHum, playNeonBuzz]);

  /**
   * Arrête l'ambiance de fond (hum + buzz)
   */
  const stopAmbience = useCallback(() => {
    isAmbienceActiveRef.current = false;

    // Arrêter le timer de buzz
    if (buzzTimerRef.current) {
      clearTimeout(buzzTimerRef.current);
      buzzTimerRef.current = null;
    }

    // Arrêter le bourdonnement
    try {
      const howl = howlsRef.current.backgroundHum;
      if (howl) {
        howl.stop();
      }
    } catch {
      // Ignorer
    }
  }, []);

  /**
   * Arrête tous les sons
   */
  const stopAll = useCallback(() => {
    try {
      Howler.stop();
      stopAmbience();
    } catch {
      // Ignorer
    }
  }, [stopAmbience]);

  /**
   * Cleanup au démontage
   */
  useEffect(() => {
    return () => {
      stopAmbience();
      // Libérer les ressources Howl
      Object.values(howlsRef.current).forEach((howl) => {
        if (howl) {
          howl.unload();
        }
      });
    };
  }, [stopAmbience]);

  /**
   * Gère l'arrêt de l'ambiance quand l'audio est désactivé
   */
  useEffect(() => {
    if (!enabled) {
      stopAmbience();
    }
  }, [enabled, stopAmbience]);

  return {
    // État
    enabled,
    volume,
    muted,
    hasInteracted,
    
    // Contrôles globaux
    toggleAudio,
    toggleMute,
    setVolume,
    enableAudio,
    stopAll,
    
    // Effets individuels
    playEffect,
    playBackgroundHum,
    playNeonBuzz,
    playTerminalBeep,
    playDoorCreak,
    playRareGlitch,
    playHoverBeep,
    playMechanicalClick,
    
    // Ambiance
    startAmbience,
    stopAmbience,
  };
}

export default useAudio;
