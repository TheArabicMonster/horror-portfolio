"use client";

import React from "react";

/**
 * @file Jumpscare.tsx
 * @description Jumpscare rare qui apparaît aléatoirement
 * @author Agent 7 - Easter Eggs
 * 
 * Easter Egg #2: Jumpscare aléatoire
 * - 1% de chance toutes les 2 minutes
 * - Flash d'image + son playRareGlitch()
 * - Désactivable en mode debug
 * - Reset après 500ms
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UseJumpscareOptions {
  /** Chance sur 1000 (défaut: 10 = 1%) */
  chance?: number;
  /** Intervalle en ms (défaut: 120000 = 2 min) */
  interval?: number;
  /** Désactivé si true */
  disabled?: boolean;
}

/**
 * Hook pour gérer le jumpscare aléatoire
 */
export function useJumpscare(options: UseJumpscareOptions = {}): {
  isActive: boolean;
  trigger: () => void;
  disable: () => void;
  enable: () => void;
} {
  const { 
    chance = 10, // 1% de chance (10/1000)
    interval = 120000, // 2 minutes
    disabled = false 
  } = options;
  
  const [isActive, setIsActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Déclenche le jumpscare
  const triggerJumpscare = useCallback(() => {
    if (!isEnabled || disabled) return;
    
    setIsActive(true);
    
    // Joue le son glitch si disponible via le contexte audio global
    if (typeof window !== "undefined") {
      const event = new CustomEvent("playRareGlitch");
      window.dispatchEvent(event);
    }
    
    // Reset après 500ms
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, 500);
  }, [isEnabled, disabled]);

  // Vérification périodique
  useEffect(() => {
    if (disabled || !isEnabled) return;
    
    intervalRef.current = setInterval(() => {
      // 1% de chance
      if (Math.random() * 1000 < chance) {
        triggerJumpscare();
      }
    }, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [chance, interval, disabled, isEnabled, triggerJumpscare]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const trigger = useCallback(() => {
    triggerJumpscare();
  }, [triggerJumpscare]);

  const disable = useCallback(() => {
    setIsEnabled(false);
  }, []);

  const enable = useCallback(() => {
    setIsEnabled(true);
  }, []);

  return { isActive, trigger, disable, enable };
}

/**
 * Composant visuel du jumpscare
 */
export function JumpscareOverlay({ 
  isActive,
  debugMode = false 
}: { 
  isActive: boolean;
  debugMode?: boolean;
}): React.JSX.Element | null {
  // Ne rien afficher si inactif ou en mode debug
  if (!isActive || debugMode) return null;
  
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
          className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
        >
          {/* Image glitchée */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: [0, 1, 0.8, 1, 0],
              rotate: [0, -5, 5, -3, 0],
            }}
            transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.8, 1] }}
            className="relative"
          >
            {/* Cercle effrayant */}
            <div 
              className="w-64 h-64 rounded-full"
              style={{
                background: "radial-gradient(circle, #ff0000 0%, #800000 40%, #000000 70%)",
                boxShadow: "0 0 100px #ff0000, inset 0 0 50px #000",
              }}
            >
              {/* Yeux */}
              <div className="absolute top-1/3 left-1/4 w-12 h-6 bg-black rounded-full transform -rotate-12">
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
              <div className="absolute top-1/3 right-1/4 w-12 h-6 bg-black rounded-full transform rotate-12">
                <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
              
              {/* Bouche */}
              <div 
                className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2"
                style={{
                  width: "80px",
                  height: "40px",
                  background: "linear-gradient(to bottom, #000 0%, #300 100%)",
                  borderRadius: "0 0 40px 40px",
                  boxShadow: "0 0 20px #500",
                }}
              />
            </div>
            
            {/* Texte glitch */}
            <motion.div
              animate={{ 
                x: [-2, 2, -2, 0],
                opacity: [1, 0.5, 1, 0],
              }}
              transition={{ duration: 0.2, repeat: 2 }}
              className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-red-600 font-mono text-2xl font-bold whitespace-nowrap"
              style={{
                textShadow: "2px 0 #0ff, -2px 0 #f0f",
              }}
            >
              SYSTEM ERROR
            </motion.div>
          </motion.div>
          
          {/* Flash blanc */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default JumpscareOverlay;
