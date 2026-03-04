"use client";

import React from "react";

/**
 * @file WebGLFallback.tsx
 * @description Message si WebGL n'est pas supporté
 * @author Agent 7 - Debug Tools
 * 
 * Détecte:
 * - Support WebGL via navigator
 * - Affiche message "WEBGL REQUIRED"
 * - Lien vers galerie 2D fallback
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TerminalText from "./TerminalText";

/**
 * Détecte si WebGL est supporté
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return true; // Assume support côté serveur
  
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return gl instanceof WebGLRenderingContext;
  } catch {
    return false;
  }
}

/**
 * Détecte si WebGL2 est supporté
 */
export function isWebGL2Supported(): boolean {
  if (typeof window === "undefined") return true;
  
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    return gl instanceof WebGL2RenderingContext;
  } catch {
    return false;
  }
}

/**
 * Hook pour vérifier le support WebGL
 */
export function useWebGLSupport(): {
  supported: boolean;
  webgl2: boolean;
  checking: boolean;
} {
  const [supported, setSupported] = useState(true);
  const [webgl2, setWebgl2] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Petit délai pour ne pas bloquer le rendu initial
    const timer = setTimeout(() => {
      setSupported(isWebGLSupported());
      setWebgl2(isWebGL2Supported());
      setChecking(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return { supported, webgl2, checking };
}

/**
 * Composant fallback quand WebGL n'est pas supporté
 */
export function WebGLFallbackScreen(): React.JSX.Element {
  const router = useRouter();

  const categories = [
    { id: "illustrations", label: "ILLUSTRATIONS", color: "#00ffff" },
    { id: "photos", label: "PHOTOS", color: "#ff00ff" },
    { id: "videos", label: "VIDEOS", color: "#ffff00" },
  ] as const;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a1a 100%)",
      }}
    >
      {/* Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 4px
          )`,
        }}
      />

      <div 
        className="relative max-w-lg w-full p-8 rounded-lg text-center"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          border: "2px solid #ff0000",
          boxShadow: "0 0 50px rgba(255, 0, 0, 0.3), inset 0 0 50px rgba(255, 0, 0, 0.1)",
        }}
      >
        {/* Icône d'erreur */}
        <div 
          className="text-6xl mb-6 animate-pulse"
          style={{
            textShadow: "0 0 20px #ff0000",
          }}
        >
          ⚠️
        </div>

        {/* Titre */}
        <TerminalText
          text="WEBGL REQUIRED"
          color="blood"
          fontSize={32}
          className="mb-4"
        />

        {/* Message */}
        <div className="space-y-4 mb-8">
          <p className="text-red-400 font-mono text-sm">
            Your browser does not support WebGL or it is disabled.
          </p>
          <p className="text-gray-500 font-mono text-xs">
            The 3D experience cannot be loaded.
          </p>
          <p className="text-gray-600 font-mono text-xs">
            Please enable WebGL in your browser settings or use a compatible browser:
            Chrome, Firefox, Safari, or Edge.
          </p>
        </div>

        {/* Alternative 2D */}
        <div 
          className="p-4 mb-6 rounded"
          style={{
            backgroundColor: "rgba(0, 255, 0, 0.05)",
            border: "1px solid rgba(0, 255, 0, 0.3)",
          }}
        >
          <p className="text-green-400 font-mono text-sm mb-4">
            [ALTERNATIVE: 2D MODE AVAILABLE]
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`/gallery/${cat.id}`)}
                className="p-3 font-mono text-xs rounded transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  border: `1px solid ${cat.color}`,
                  color: cat.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = cat.color;
                  e.currentTarget.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                  e.currentTarget.style.color = cat.color;
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-600 font-mono">
          <p>Error Code: WEBGL_NOT_SUPPORTED</p>
          <p className="mt-1">{navigator.userAgent}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant qui vérifie WebGL et affiche le fallback si nécessaire
 */
export function WebGLChecker({ 
  children,
  fallback = <WebGLFallbackScreen />,
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.JSX.Element {
  const { supported, checking } = useWebGLSupport();

  if (checking) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <div className="text-center">
          <TerminalText
            text="CHECKING WEBGL..."
            color="terminal"
            fontSize={24}
            className="mb-4"
          />
          <div 
            className="w-48 h-1 mx-auto overflow-hidden rounded"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            <div 
              className="h-full animate-pulse"
              style={{
                backgroundColor: "#00ff00",
                width: "50%",
                animation: "loading 1s infinite ease-in-out",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!supported) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default WebGLFallbackScreen;
