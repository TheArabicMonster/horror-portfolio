"use client";

import React from "react";

/**
 * @file SecretCursor.tsx
 * @description Curseur secret qui change après inactivité
 * @author Agent 7 - Easter Eggs
 * 
 * Easter Egg #4: Secret Cursor
 * - Détecte inactivité souris de 10 secondes
 * - Change le curseur en "?" ou autre symbole mystérieux
 * - Retour normal au mouvement
 * - Fonctionne sur toute l'application
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSecretCursorOptions {
  /** Temps d'inactivité en ms (défaut: 10000 = 10s) */
  idleTime?: number;
  /** Désactivé si true */
  disabled?: boolean;
}

/**
 * Hook pour détecter l'inactivité et changer le curseur
 */
export function useSecretCursor(options: UseSecretCursorOptions = {}): {
  isIdle: boolean;
  cursorStyle: string;
} {
  const { idleTime = 10000, disabled = false } = options;
  
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetIdle = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (isIdle) {
      setIsIdle(false);
    }
    
    // Clear et redémarre le timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (!disabled) {
      timeoutRef.current = setTimeout(() => {
        setIsIdle(true);
      }, idleTime);
    }
  }, [idleTime, isIdle, disabled]);

  // Écoute les événements d'activité
  useEffect(() => {
    if (disabled || typeof window === "undefined") return;
    
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
    
    events.forEach(event => {
      window.addEventListener(event, resetIdle, { passive: true });
    });
    
    // Démarre le timer initial
    resetIdle();
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetIdle);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetIdle, disabled]);

  // Génère le style de curseur
  const cursorStyle = isIdle 
    ? 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'><text y=\'24\' font-size=\'24\'>❓</text></svg>") 16 16, help'
    : "auto";

  return { isIdle, cursorStyle };
}

/**
 * Composant pour appliquer le curseur secret globalement
 */
export function SecretCursor({ 
  children,
  idleTime = 10000,
  disabled = false,
}: { 
  children: React.ReactNode;
  idleTime?: number;
  disabled?: boolean;
}): React.JSX.Element {
  const { cursorStyle } = useSecretCursor({ idleTime, disabled });

  return (
    <div style={{ cursor: cursorStyle, minHeight: "100vh" }}>
      {children}
    </div>
  );
}

/**
 * Composant indicateur discret quand le curseur est en mode secret
 */
export function SecretCursorIndicator({
  idleTime = 10000,
  disabled = false,
}: {
  idleTime?: number;
  disabled?: boolean;
}): React.JSX.Element | null {
  const { isIdle } = useSecretCursor({ idleTime, disabled });
  
  if (!isIdle) return null;
  
  return (
    <div 
      className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs font-mono opacity-50 pointer-events-none transition-opacity duration-300"
      style={{
        color: "#00ff00",
        textShadow: "0 0 5px #00ff00",
      }}
    >
      ?
    </div>
  );
}

export default SecretCursor;
