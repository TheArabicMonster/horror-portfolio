"use client";

import React from "react";

/**
 * @file FakeVirus.tsx
 * @description Faussse alerte virus style Windows 95
 * @author Agent 7 - Easter Eggs
 * 
 * Easter Egg #3: Fake Virus
 * - Fenêtre style Win95 "VIRUS DETECTED"
 * - Apparaît aléatoirement (très rare)
 * - Bouton "PANIC" qui ferme la fenêtre
 * - Effet shake de l'écran
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface UseFakeVirusOptions {
  /** Chance sur 10000 (défaut: 5 = 0.05%) */
  chance?: number;
  /** Intervalle minimum en ms (défaut: 5 min) */
  minInterval?: number;
  /** Désactivé si true */
  disabled?: boolean;
}

/**
 * Hook pour gérer l'alerte virus aléatoire
 */
export function useFakeVirus(options: UseFakeVirusOptions = {}): {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
} {
  const { 
    chance = 5, // 0.05% de chance
    minInterval = 300000, // 5 minutes minimum
    disabled = false 
  } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const lastShownRef = useRef<number>(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback(() => {
    const now = Date.now();
    // Respecte l'intervalle minimum
    if (now - lastShownRef.current < minInterval) return;
    
    setIsVisible(true);
    lastShownRef.current = now;
  }, [minInterval]);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Vérification périodique très rare
  useEffect(() => {
    if (disabled) return;
    
    checkIntervalRef.current = setInterval(() => {
      // Chance très faible: 0.05%
      if (Math.random() * 10000 < chance) {
        show();
      }
    }, 30000); // Vérifie toutes les 30 secondes
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [chance, disabled, show]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  return { isVisible, show, hide };
}

/**
 * Composant fenêtre virus style Win95
 */
export function FakeVirusWindow({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean;
  onClose: () => void;
}): React.JSX.Element | null {
  const [shake, setShake] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Effet shake quand visible
  useEffect(() => {
    if (!isVisible) return;
    
    // Démarre le shake
    setShake(true);
    const shakeTimeout = setTimeout(() => setShake(false), 500);
    
    // Animation de progression
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 99) return 99;
        return p + Math.random() * 5;
      });
    }, 200);
    
    return () => {
      clearTimeout(shakeTimeout);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            x: shake ? [0, -5, 5, -5, 5, 0] : 0,
            y: shake ? [0, 3, -3, 3, -3, 0] : 0,
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="fixed inset-0 z-[9997] flex items-center justify-center pointer-events-auto"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
        >
          {/* Fenêtre Win95 */}
          <div 
            className="w-96 shadow-2xl select-none"
            style={{
              background: "#c0c0c0",
              border: "2px solid",
              borderColor: "#ffffff #808080 #808080 #ffffff",
              boxShadow: shake ? "0 0 50px rgba(255, 0, 0, 0.5)" : "none",
            }}
          >
            {/* Barre de titre */}
            <div 
              className="px-2 py-1 flex justify-between items-center"
              style={{
                background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
              }}
            >
              <span className="text-white font-bold text-sm flex items-center gap-2">
                <span>⚠</span>
                VIRUS DETECTED
              </span>
              <button 
                className="w-4 h-4 flex items-center justify-center text-xs"
                style={{
                  background: "#c0c0c0",
                  border: "1px solid",
                  borderColor: "#ffffff #808080 #808080 #ffffff",
                }}
                onClick={onClose}
              >
                ×
              </button>
            </div>
            
            {/* Contenu */}
            <div className="p-4 space-y-4">
              {/* Icône + message */}
              <div className="flex gap-4 items-start">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-3xl flex-shrink-0"
                  style={{
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#808080 #ffffff #ffffff #808080",
                  }}
                >
                  ☠️
                </div>
                <div className="text-black text-sm font-sans space-y-2">
                  <p className="font-bold text-red-700">
                    CRITICAL ERROR!
                  </p>
                  <p>
                    A virus has been detected in your system files.
                  </p>
                  <p>
                    Files infected: <span className="font-mono font-bold">{Math.floor(Math.random() * 900) + 100}</span>
                  </p>
                  <p className="text-xs text-gray-600">
                    Location: C:\\WINDOWS\\SYSTEM32\\HORROR.DLL
                  </p>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-black font-sans">
                  <span>Deleting files...</span>
                  <span>{Math.min(99, Math.floor(progress))}%</span>
                </div>
                <div 
                  className="h-5 p-0.5"
                  style={{
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#808080 #ffffff #ffffff #808080",
                  }}
                >
                  <div 
                    className="h-full transition-all duration-200"
                    style={{
                      width: `${Math.min(100, progress)}%`,
                      background: `repeating-linear-gradient(
                        90deg,
                        #000080,
                        #000080 8px,
                        #1084d0 8px,
                        #1084d0 16px
                      )`,
                    }}
                  />
                </div>
              </div>
              
              {/* Compte à rebours */}
              <div className="text-center text-red-700 font-bold font-mono animate-pulse">
                SYSTEM SHUTDOWN IN: {Math.max(0, 60 - Math.floor(progress / 2))}s
              </div>
              
              {/* Bouton PANIC */}
              <div className="flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-8 py-2 font-bold text-sm"
                  style={{
                    background: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#ffffff #808080 #808080 #ffffff",
                    color: "#000",
                  }}
                >
                  🚨 PANIC 🚨
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Scanlines overlay sur la fenêtre */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.3) 2px,
                rgba(0,0,0,0.3) 4px
              )`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FakeVirusWindow;
