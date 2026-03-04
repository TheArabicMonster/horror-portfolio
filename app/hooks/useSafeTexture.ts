'use client';

import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * @file useSafeTexture.ts
 * @description Hook pour charger des textures de manière sécurisée avec fallback
 * @author Fix - Gestion erreurs textures
 */

let fallbackTextureCache: THREE.Texture | null = null;

// Texture de fallback (gradient noir-gris)
const createFallbackTexture = (): THREE.Texture => {
  // Retourne la texture en cache si elle existe
  if (fallbackTextureCache) {
    return fallbackTextureCache;
  }
  
  // Vérifie si on est côté client
  if (typeof document === 'undefined') {
    // Retourne une texture vide côté serveur
    const placeholderTexture = new THREE.Texture();
    placeholderTexture.needsUpdate = true;
    return placeholderTexture;
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Gradient diagonal
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(0.5, '#2a2a2a');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Texte "NO SIGNAL"
    ctx.fillStyle = '#00ff41';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NO SIGNAL', 256, 256);
    
    // Lignes de scan
    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 512; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  // Cache la texture
  fallbackTextureCache = texture;
  
  return texture;
};

/**
 * Hook pour charger une texture de manière sécurisée
 * @param url - URL de l'image à charger
 * @returns La texture chargée ou une texture de fallback
 */
export function useSafeTexture(url: string | undefined): THREE.Texture {
  const fallbackTexture = useMemo(() => createFallbackTexture(), []);
  const [texture, setTexture] = useState<THREE.Texture>(fallbackTexture);

  useEffect(() => {
    if (!url) {
      setTexture(fallbackTexture);
      return;
    }

    const loader = new THREE.TextureLoader();
    
    loader.load(
      url,
      (loadedTexture) => {
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined, // onProgress
      (error) => {
        console.warn(`Failed to load texture: ${url}`, error);
        setTexture(fallbackTexture);
      }
    );
  }, [url, fallbackTexture]);

  return texture;
}

export default useSafeTexture;
