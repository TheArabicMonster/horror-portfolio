"use client";

/**
 * @file NoiseOverlay.tsx
 * @description Overlay de bruit TV statique animé avec Canvas
 * @author Agent 2 - UI Components
 */

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

/**
 * Props pour le composant NoiseOverlay
 */
/**
 * Props pour le composant NoiseOverlay
 */
export interface NoiseOverlayProps {
  /** Opacité du bruit (0 à 1) */
  opacity?: number;
  /** Densité du bruit (0 à 1, défaut: 0.5) */
  density?: number;
  /** Vitesse de l'animation en FPS (défaut: 30) */
  fps?: number;
  /** Classe CSS additionnelle */
  className?: string;
  /** Mode blend pour le bruit */
  blendMode?: "normal" | "multiply" | "screen" | "overlay" | "soft-light";
}

/**
 * Overlay de bruit TV statique authentique
 * Utilise un canvas pour générer du bruit aléatoire en temps réel
 * 
 * @example
 * ```tsx
 * <NoiseOverlay 
 *   opacity={0.05}
 *   density={0.3}
 *   fps={24}
 *   blendMode="overlay"
 * />
 * ```
 */
export default function NoiseOverlay({
  opacity = 0.05,
  density = 0.5,
  fps = 30,
  className = "",
  blendMode = "overlay",
}: NoiseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  /**
   * Génère une frame de bruit aléatoire
   */
  const generateNoise = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      // Facteur de densité (probabilité qu'un pixel soit visible)
      const threshold = 1 - density;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();

        if (noise > threshold) {
          // Intensité du bruit
          const value = Math.floor(Math.random() * 255);
          data[i] = value;     // R
          data[i + 1] = value; // G
          data[i + 2] = value; // B
          data[i + 3] = Math.floor(Math.random() * 100 + 155); // A (semi-transparent)
        } else {
          // Pixel transparent
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    },
    [density]
  );

  /**
   * Boucle d'animation
   */
  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Limiter les FPS
      const frameInterval = 1000 / fps;
      if (timestamp - lastFrameTime.current < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      lastFrameTime.current = timestamp;
      generateNoise(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(animate);
    },
    [fps, generateNoise]
  );

  // Redimensionnement du canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Démarrage de l'animation
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <motion.canvas
      ref={canvasRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: opacity }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 pointer-events-none z-30 ${className}`}
      style={{
        mixBlendMode: blendMode,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Version SVG alternative plus légère si le canvas pose problème
 * Génère un pattern de bruit statique
 */
export function NoiseOverlaySVG({
  opacity = 0.05,
  className = "",
  blendMode = "overlay",
}: Omit<NoiseOverlayProps, "density" | "fps">) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: opacity }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 pointer-events-none z-30 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        mixBlendMode: blendMode,
        animation: "static 0.5s steps(10) infinite",
      }}
      aria-hidden="true"
    />
  );
}

