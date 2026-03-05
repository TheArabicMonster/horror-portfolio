"use client";

/**
 * @file useDoorSound.ts
 * @description Hook de son de porte d'ascenseur avec grincement + moteur électrique
 * @author Agent 2 - Sons & Audio
 * 
 * Deux sons séquentiels:
 * 1. Grincement métallique (début, volume 0.6)
 * 2. Moteur électrique (après 200ms, volume 0.4)
 * 
 * Sons générés procéduralement en Base64 (pas de fichiers externes)
 */

import { useCallback, useRef } from "react";
import { Howl } from "howler";

/**
 * Génère un WAV Base64 à partir d'une fonction de génération audio
 */
function generateWavBase64(
  duration: number,
  sampleRate: number,
  generator: (samples: Float32Array) => void
): string {
  const numSamples = Math.floor(duration * sampleRate);
  const samples = new Float32Array(numSamples);
  
  // Générer les échantillons
  generator(samples);
  
  // Convertir en PCM 16-bit
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  
  // Header WAV
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  
  // Convertir float32 en int16
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  
  // Convertir en Base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Génère un grincement métallique intense pour porte d'ascenseur
 * Style: métal lourd qui résiste, friction métallique aiguë
 */
function generateMetalCreak(): string {
  const duration = 0.6; // 600ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const baseFreq = 150; // Hz - plus grave pour métal lourd
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const progress = i / samples.length;
      
      // Fréquence qui descend avec variation non-linéaire
      const freq = baseFreq * (1 - progress * 0.5);
      
      // Oscillation rapide et irrégulière pour le grincement métallique
      const creak = Math.sin(2 * Math.PI * 8 * t) * 0.4 + 
                    Math.sin(2 * Math.PI * 3.7 * t) * 0.3 + 0.7;
      
      // Square wave pour caractère métallique cassant
      const square = Math.sign(Math.sin(2 * Math.PI * freq * creak * t));
      
      // Bruit de friction métallique aigu
      const friction = (Math.random() * 2 - 1) * 0.3 * (1 - progress * 0.5);
      
      // Résonance métallique
      const resonance = Math.sin(2 * Math.PI * freq * 2.5 * t) * 
                       Math.exp(-progress * 2) * 0.2;
      
      // Enveloppe avec attaque rapide et sustain court
      const attack = Math.min(progress * 8, 1);
      const release = Math.exp(-progress * 3);
      const envelope = attack * release;
      
      samples[i] = (square * 0.5 + friction + resonance) * envelope * 0.7;
    }
  });
}

/**
 * Génère un son de moteur électrique d'ascenseur
 * Style: moteur électrique qui démarre et accélère
 */
function generateElectricMotor(): string {
  const duration = 0.8; // 800ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const progress = i / samples.length;
      
      // Fréquence qui monte (moteur qui accélère)
      const startFreq = 80;
      const endFreq = 250;
      const freq = startFreq + (endFreq - startFreq) * Math.pow(progress, 0.7);
      
      // Onde sinusoïdale avec harmoniques pour le moteur
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const harmonic2 = Math.sin(2 * Math.PI * freq * 2 * t) * 0.4;
      const harmonic3 = Math.sin(2 * Math.PI * freq * 3 * t) * 0.2;
      
      // Bruit électromécanique
      const electricalNoise = (Math.random() * 2 - 1) * 0.15 * (0.5 + progress * 0.5);
      
      // Vibration mécanique basse fréquence
      const vibration = Math.sin(2 * Math.PI * 20 * t) * 0.1 * (1 - progress * 0.3);
      
      // Buzz de fréquence élevée qui augmente
      const buzz = Math.sin(2 * Math.PI * (400 + progress * 200) * t) * 0.15 * progress;
      
      // Enveloppe avec attaque progressive (moteur qui démarre)
      const attack = Math.min(Math.pow(progress * 3, 2), 1);
      const envelope = attack * (0.8 + 0.2 * Math.sin(2 * Math.PI * 10 * t));
      
      samples[i] = (fundamental * 0.5 + harmonic2 + harmonic3 + 
                    electricalNoise + vibration + buzz) * envelope * 0.5;
    }
  });
}

// Cache pour les URLs de sons
let soundCache: { metalCreak: string; electricMotor: string } | null = null;

/**
 * Obtient les URLs des sons (génère une seule fois)
 */
function getSoundUrls(): { metalCreak: string; electricMotor: string } {
  if (soundCache) return soundCache;
  
  soundCache = {
    metalCreak: `data:audio/wav;base64,${generateMetalCreak()}`,
    electricMotor: `data:audio/wav;base64,${generateElectricMotor()}`,
  };
  
  return soundCache;
}

/**
 * Interface de retour du hook useDoorSound
 */
interface UseDoorSoundReturn {
  /** Joue la séquence de son d'ouverture de porte (grincement + moteur) */
  playDoorOpen: () => void;
}

/**
 * Hook pour jouer les sons d'ouverture de porte d'ascenseur
 * 
 * Joue un grincement métallique suivi d'un moteur électrique après 200ms
 * 
 * @example
 * ```tsx
 * const { playDoorOpen } = useDoorSound();
 * 
 * // Sur clic ouverture de porte
 * <button onClick={playDoorOpen}>Ouvrir la porte</button>
 * ```
 */
export function useDoorSound(): UseDoorSoundReturn {
  const urlsRef = useRef(getSoundUrls());
  
  /**
   * Joue la séquence complète d'ouverture de porte
   * 1. Grincement métallique (volume 0.6)
   * 2. Moteur électrique après 200ms (volume 0.4)
   */
  const playDoorOpen = useCallback(() => {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
      console.warn('[DoorSound] Cannot play sound on server');
      return;
    }
    
    try {
      // Grincement métallique immédiat
      const creak = new Howl({
        src: [urlsRef.current.metalCreak],
        volume: 0.6,
        html5: false,
        onplayerror: (_id, error) => {
          console.warn("[DoorSound] Erreur lecture grincement:", error);
        },
      });
      
      creak.play();
      
      // Moteur électrique après 200ms
      setTimeout(() => {
        const motor = new Howl({
          src: [urlsRef.current.electricMotor],
          volume: 0.4,
          html5: false,
          onplayerror: (_id, error) => {
            console.warn("[DoorSound] Erreur lecture moteur:", error);
          },
        });
        
        motor.play();
      }, 200);
    } catch (err) {
      console.error('[DoorSound] Error playing door sound:', err);
    }
  }, []);
  
  return { playDoorOpen };
}

export default useDoorSound;
