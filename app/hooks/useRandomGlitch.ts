"use client";

/**
 * @file useRandomGlitch.ts
 * @description Hook pour déclencher des glitchs audio aléatoires
 * @author Agent 5 - Audio & Atmosphere
 * 
 * 1% de chance toutes les 30 secondes de déclencher playRareGlitch()
 * Crée une atmosphère d'imprévisibilité et de tension
 */

import { useEffect, useRef, useCallback } from "react";
import { useAudioContext } from "@/app/context/AudioContext";

/**
 * Configuration du glitch aléatoire
 */
interface RandomGlitchConfig {
  /** Intervalle de vérification en ms (défaut: 30000 = 30s) */
  checkInterval?: number;
  /** Probabilité de déclenchement (0-1, défaut: 0.01 = 1%) */
  probability?: number;
  /** Délai minimum entre deux glitchs en ms (défaut: 60000 = 60s) */
  minDelayBetweenGlitches?: number;
}

/**
 * Hook pour déclencher des glitchs audio aléatoires
 * 
 * @param config - Configuration optionnelle
 * 
 * @example
 * ```tsx
 * // Utilisation avec valeurs par défaut (1% toutes les 30s)
 * useRandomGlitch();
 * 
 * // Configuration personnalisée
 * useRandomGlitch({
 *   checkInterval: 10000,  // Vérifier toutes les 10s
 *   probability: 0.05,     // 5% de chance
 *   minDelayBetweenGlitches: 30000, // Min 30s entre glitchs
 * });
 * ```
 */
export function useRandomGlitch(config: RandomGlitchConfig = {}): void {
  const {
    checkInterval = 30000,      // 30 secondes
    probability = 0.01,         // 1% de chance
    minDelayBetweenGlitches = 60000, // 60 secondes minimum
  } = config;

  const { audioEnabled, hasInteracted, playGlitch } = useAudioContext();
  
  // Références pour le timer et le dernier glitch
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGlitchTimeRef = useRef<number>(0);

  /**
   * Tente de déclencher un glitch aléatoire
   */
  const attemptGlitch = useCallback(() => {
    // Vérifier si l'audio est activé et si l'utilisateur a interagi
    if (!audioEnabled || !hasInteracted) {
      return;
    }

    const now = Date.now();
    const timeSinceLastGlitch = now - lastGlitchTimeRef.current;

    // Vérifier le délai minimum entre glitchs
    if (timeSinceLastGlitch < minDelayBetweenGlitches) {
      return;
    }

    // Test de probabilité
    if (Math.random() < probability) {
      try {
        playGlitch();
        lastGlitchTimeRef.current = now;
        
        // Log en mode debug (peut être retiré en production)
        if (process.env.NODE_ENV === "development") {
          console.log("[RandomGlitch] Glitch audio déclenché");
        }
      } catch (error) {
        console.warn("[RandomGlitch] Erreur lors du déclenchement:", error);
      }
    }
  }, [audioEnabled, hasInteracted, playGlitch, probability, minDelayBetweenGlitches]);

  /**
   * Démarre le timer de vérification
   */
  useEffect(() => {
    // Ne démarrer que si l'audio est prêt
    if (!audioEnabled || !hasInteracted) {
      return;
    }

    // Intervalle de vérification
    intervalRef.current = setInterval(() => {
      attemptGlitch();
    }, checkInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [audioEnabled, hasInteracted, checkInterval, attemptGlitch]);

  /**
   * Reset du timer si les dépendances changent
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}

/**
 * Version avancée avec plus de contrôle
 * Permet de forcer un glitch ou de modifier la probabilité dynamiquement
 */
export function useRandomGlitchAdvanced(config: RandomGlitchConfig = {}) {
  const {
    checkInterval = 30000,
    probability = 0.01,
    minDelayBetweenGlitches = 60000,
  } = config;

  const { audioEnabled, hasInteracted, playGlitch } = useAudioContext();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastGlitchTimeRef = useRef<number>(0);
  const currentProbabilityRef = useRef<number>(probability);

  // Mettre à jour la probabilité si elle change
  useEffect(() => {
    currentProbabilityRef.current = probability;
  }, [probability]);

  /**
   * Force le déclenchement d'un glitch immédiatement
   */
  const forceGlitch = useCallback(() => {
    if (!audioEnabled || !hasInteracted) {
      return false;
    }

    try {
      playGlitch();
      lastGlitchTimeRef.current = Date.now();
      return true;
    } catch (error) {
      console.warn("[RandomGlitch] Erreur forceGlitch:", error);
      return false;
    }
  }, [audioEnabled, hasInteracted, playGlitch]);

  /**
   * Tente de déclencher un glitch aléatoire
   */
  const attemptGlitch = useCallback(() => {
    if (!audioEnabled || !hasInteracted) {
      return false;
    }

    const now = Date.now();
    const timeSinceLastGlitch = now - lastGlitchTimeRef.current;

    if (timeSinceLastGlitch < minDelayBetweenGlitches) {
      return false;
    }

    if (Math.random() < currentProbabilityRef.current) {
      return forceGlitch();
    }

    return false;
  }, [audioEnabled, hasInteracted, forceGlitch, minDelayBetweenGlitches]);

  /**
   * Démarre le timer
   */
  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      attemptGlitch();
    }, checkInterval);
  }, [checkInterval, attemptGlitch]);

  /**
   * Arrête le timer
   */
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Démarre/arrête automatiquement selon l'état audio
   */
  useEffect(() => {
    if (audioEnabled && hasInteracted) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [audioEnabled, hasInteracted, start, stop]);

  return {
    forceGlitch,
    attemptGlitch,
    start,
    stop,
    lastGlitchTime: lastGlitchTimeRef.current,
  };
}

export default useRandomGlitch;
