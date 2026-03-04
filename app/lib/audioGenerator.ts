"use client";

/**
 * Générateur de sons procéduraux utilisant Web Audio API
 * Aucun fichier externe - tout est généré en temps réel
 */

// Singleton AudioContext
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

export function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    return ctx.resume();
  }
  return Promise.resolve();
}

/**
 * Crée un buffer audio à partir d'une fonction de génération
 */
function createBuffer(
  duration: number,
  generator: (channelData: Float32Array, sampleRate: number) => void
): AudioBuffer | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.ceil(duration * sampleRate), sampleRate);
  generator(buffer.getChannelData(0), sampleRate);
  return buffer;
}

/**
 * Bourdonnement basse fréquence - ambiance type FNAF
 * 100Hz sine wave avec légère modulation
 */
export function createHum(): AudioBuffer | null {
  return createBuffer(2.0, (channelData, sampleRate) => {
    const frequency = 100; // Hz
    const modulationFreq = 0.5; // Hz - lente oscillation d'amplitude
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Sine wave avec enveloppe modulée pour créer un bourdonnement vivant
      const envelope = 0.7 + 0.3 * Math.sin(2 * Math.PI * modulationFreq * t);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
  });
}

/**
 * Buzz intermittent de néon/fluorescent
 * 60Hz avec bruit blanc
 */
export function createBuzz(): AudioBuffer | null {
  return createBuffer(0.15, (channelData, sampleRate) => {
    const frequency = 60; // Hz - fréquence ligne électrique
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Sawtooth pour le buzz + bruit blanc
      const sawtooth = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
      const noise = (Math.random() * 2 - 1) * 0.3;
      channelData[i] = (sawtooth * 0.6 + noise) * 0.25;
    }
  });
}

/**
 * Bip terminal/UI
 * 800Hz sine, 50ms
 */
export function createBeep(): AudioBuffer | null {
  return createBuffer(0.05, (channelData, sampleRate) => {
    const frequency = 800; // Hz
    const duration = channelData.length / sampleRate;
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Enveloppe exponentielle décroissante
      const envelope = Math.exp(-t / (duration * 0.3));
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.5;
    }
  });
}

/**
 * Clic mécanique
 * 2kHz impulsion très courte
 */
export function createClick(): AudioBuffer | null {
  return createBuffer(0.01, (channelData, sampleRate) => {
    const frequency = 2000; // Hz
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Impulsion sinusoïdale très courte
      const envelope = Math.exp(-t / 0.002);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.6;
    }
  });
}

/**
 * Son de porte métallique
 * Sawtooth modulé avec résonance
 */
export function createDoorSound(): AudioBuffer | null {
  return createBuffer(0.4, (channelData, sampleRate) => {
    const baseFreq = 150; // Hz
    const modulation = 8; // Hz
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Fréquence qui descend (porte qui grince)
      const freqDrop = baseFreq - (baseFreq * 0.3 * t / 0.4);
      const modulated = freqDrop * (1 + 0.1 * Math.sin(2 * Math.PI * modulation * t));
      
      // Sawtooth pour le caractère métallique
      const saw = 2 * (t * modulated - Math.floor(t * modulated + 0.5));
      
      // Enveloppe avec attaque et relâchement
      const attack = Math.min(t / 0.02, 1);
      const release = Math.exp(-(t - 0.02) / 0.15);
      const envelope = attack * (t > 0.02 ? release : 1);
      
      channelData[i] = saw * envelope * 0.4;
    }
  });
}

/**
 * Glitch/artefact numérique
 * Burst de bruit avec filtre
 */
export function createGlitch(): AudioBuffer | null {
  return createBuffer(0.2, (channelData, sampleRate) => {
    const burstStart = 0.05;
    const burstEnd = 0.15;
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      
      // Burst de bruit aléatoire
      if (t >= burstStart && t <= burstEnd) {
        const noise = (Math.random() * 2 - 1);
        // Filtre passe-bande simulé par moyenne mobile simple
        channelData[i] = noise * 0.7;
      } else {
        channelData[i] = 0;
      }
    }
    
    // Lissage simple (filtre passe-bas)
    for (let i = 1; i < channelData.length; i++) {
      channelData[i] = channelData[i] * 0.7 + channelData[i - 1] * 0.3;
    }
  });
}

/**
 * Clic distordu pour fenêtre rétro
 */
export function createRetroClick(): AudioBuffer | null {
  return createBuffer(0.02, (channelData, sampleRate) => {
    const frequency = 1200; // Hz - plus aigu
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Carré avec distorsion
      const square = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
      const distorted = Math.tanh(square * 2); // Distorsion douce
      const envelope = Math.exp(-t / 0.005);
      channelData[i] = distorted * envelope * 0.5;
    }
  });
}

/**
 * Hover sur écran de surveillance
 * Bip très court et aigu
 */
export function createHoverBeep(): AudioBuffer | null {
  return createBuffer(0.03, (channelData, sampleRate) => {
    const frequency = 1200; // Hz
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t / 0.008);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
  });
}

// Export groupé pour utilisation facile
export const audioGenerator = {
  createHum,
  createBuzz,
  createBeep,
  createClick,
  createDoorSound,
  createGlitch,
  createRetroClick,
  createHoverBeep,
};

export default audioGenerator;
