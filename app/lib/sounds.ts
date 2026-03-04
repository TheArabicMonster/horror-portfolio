"use client";

/**
 * @file sounds.ts
 * @description URLs et configuration des sons immersifs FNAF-style
 * @author Agent 5 - Audio & Atmosphere
 * 
 * Utilise des sons générés procéduralement en Base64 (pas de fichiers externes)
 * Tous les sons sont des buffers WAV générés algorithmiquement
 */

/**
 * Génère un WAV Base64 à partir d'une fonction de génération audio
 * Cette approche évite les dépendances externes tout en fournissant des sons de qualité
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
 * Génère un bourdonnement électrique constant (60Hz hum)
 * Style: salle de serveur, transformateur électrique
 */
function generateBackgroundHum(): string {
  const duration = 3.0; // 3 secondes loop
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const freq = 60; // Hz - fréquence ligne électrique
    const harmonic2 = 120; // 2ème harmonique
    const harmonic3 = 180; // 3ème harmonique
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      
      // Fondamental 60Hz avec léger vibrato
      const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 0.5 * t);
      const fundamental = Math.sin(2 * Math.PI * freq * vibrato * t);
      
      // Harmoniques pour enrichir le timbre
      const h2 = 0.3 * Math.sin(2 * Math.PI * harmonic2 * vibrato * t);
      const h3 = 0.15 * Math.sin(2 * Math.PI * harmonic3 * vibrato * t);
      
      // Bruit de fond très subtil
      const noise = (Math.random() * 2 - 1) * 0.02;
      
      // Mixage avec enveloppe stable (pas de fade pour loop transparent)
      samples[i] = (fundamental * 0.5 + h2 + h3 + noise) * 0.4;
    }
  });
}

/**
 * Génère un buzz intermittent de néon/fluorescent
 * Style: lumière néon qui clignote/buzz
 */
function generateNeonBuzz(): string {
  const duration = 0.15; // Court, pour être joué aléatoirement
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const freq = 120; // Hz - buzz de ballast électronique
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const progress = i / samples.length;
      
      // Sawtooth pour le caractère électronique
      const sawtooth = 2 * ((t * freq) % 1) - 1;
      
      // Bruit électrique
      const noise = (Math.random() * 2 - 1) * 0.5;
      
      // Enveloppe avec attaque rapide et relâchement
      const envelope = Math.exp(-progress * 3);
      
      samples[i] = (sawtooth * 0.6 + noise * 0.4) * envelope * 0.5;
    }
  });
}

/**
 * Génère un bip terminal/UI court
 * Style: interface rétro, terminal, beep électronique
 */
function generateTerminalBeep(): string {
  const duration = 0.08; // 80ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const freq = 880; // Hz - La5, aigu et clair
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const progress = i / samples.length;
      
      // Sinusoïde pure avec légère distorsion pour caractère digital
      const sine = Math.sin(2 * Math.PI * freq * t);
      const distorted = Math.tanh(sine * 1.5); // Légère saturation
      
      // Enveloppe exponentielle décroissante
      const envelope = Math.exp(-progress * 5);
      
      samples[i] = distorted * envelope * 0.5;
    }
  });
}

/**
 * Génère un grincement de porte métallique
 * Style: porte industrielle, entrepôt abandonné
 */
function generateDoorCreak(): string {
  const duration = 0.8; // 800ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const baseFreq = 200; // Hz
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const progress = i / samples.length;
      
      // Fréquence qui descend (porte qui s'ouvre)
      const freq = baseFreq * (1 - progress * 0.6);
      
      // Oscillation lente pour le grincement
      const creak = Math.sin(2 * Math.PI * 3 * t) * 0.3 + 0.7;
      
      // Sawtooth pour le caractère métallique
      const saw = 2 * ((t * freq * creak) % 1) - 1;
      
      // Bruit de friction
      const friction = (Math.random() * 2 - 1) * 0.2 * progress;
      
      // Enveloppe avec attaque lente
      const attack = Math.min(progress * 4, 1);
      const release = 1 - progress;
      const envelope = attack * release;
      
      samples[i] = (saw * 0.7 + friction) * envelope * 0.6;
    }
  });
}

/**
 * Génère un effet glitch numérique rare
 * Style: artefact digital, corruption de données, statique
 */
function generateRareGlitch(): string {
  const duration = 0.3; // 300ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const burstStart = 0.05;
    const burstEnd = 0.25;
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      
      if (t >= burstStart && t <= burstEnd) {
        // Bruit blanc avec tonalité
        const noise = (Math.random() * 2 - 1);
        const tone = Math.sin(2 * Math.PI * 2000 * t) * 0.3;
        
        // Burst irrégulier
        const burstIntensity = Math.sin(2 * Math.PI * 20 * t) > 0 ? 1 : 0.3;
        
        samples[i] = (noise + tone) * burstIntensity * 0.5;
      } else {
        samples[i] = 0;
      }
    }
    
    // Lissage simple (filtre passe-bas simulé)
    for (let i = 1; i < samples.length; i++) {
      samples[i] = samples[i] * 0.7 + samples[i - 1] * 0.3;
    }
  });
}

/**
 * Génère un bip de hover sur écran
 * Style: surveillance, hover interface
 */
function generateHoverBeep(): string {
  const duration = 0.04; // 40ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const freq = 1200; // Hz - très aigu
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const progress = i / samples.length;
      
      const sine = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-progress * 8);
      
      samples[i] = sine * envelope * 0.25;
    }
  });
}

/**
 * Génère un clic mécanique
 * Style: bouton physique, switch rétro
 */
function generateMechanicalClick(): string {
  const duration = 0.02; // 20ms
  const sampleRate = 22050;
  
  return generateWavBase64(duration, sampleRate, (samples) => {
    const freq = 1500; // Hz
    
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      
      // Impulsion très courte
      const impulse = Math.sin(2 * Math.PI * freq * t);
      const envelope = Math.exp(-t / 0.005);
      
      samples[i] = impulse * envelope * 0.6;
    }
  });
}

// Cache pour éviter de regénérer les sons
let soundCache: Record<string, string> | null = null;

/**
 * Obtient toutes les URLs de sons (génère une seule fois)
 */
function getSoundUrls(): Record<string, string> {
  if (soundCache) return soundCache;
  
  soundCache = {
    backgroundHum: `data:audio/wav;base64,${generateBackgroundHum()}`,
    neonBuzz: `data:audio/wav;base64,${generateNeonBuzz()}`,
    terminalBeep: `data:audio/wav;base64,${generateTerminalBeep()}`,
    doorCreak: `data:audio/wav;base64,${generateDoorCreak()}`,
    rareGlitch: `data:audio/wav;base64,${generateRareGlitch()}`,
    hoverBeep: `data:audio/wav;base64,${generateHoverBeep()}`,
    mechanicalClick: `data:audio/wav;base64,${generateMechanicalClick()}`,
  };
  
  return soundCache;
}

/**
 * URLs des sons en Base64 (générés procéduralement)
 * Ces sons sont créés algorithmiquement, aucun fichier externe requis
 */
export const soundUrls = getSoundUrls();

/**
 * Configuration des sons pour Howler
 */
export const soundConfig: Record<SoundKey, { loop: boolean; volume: number; rate: number }> = {
  backgroundHum: {
    loop: true,
    volume: 0.25,
    rate: 1.0,
  },
  neonBuzz: {
    loop: false,
    volume: 0.2,
    rate: 1.0,
  },
  terminalBeep: {
    loop: false,
    volume: 0.3,
    rate: 1.0,
  },
  doorCreak: {
    loop: false,
    volume: 0.5,
    rate: 1.0,
  },
  rareGlitch: {
    loop: false,
    volume: 0.4,
    rate: 1.0,
  },
  hoverBeep: {
    loop: false,
    volume: 0.15,
    rate: 1.0,
  },
  mechanicalClick: {
    loop: false,
    volume: 0.4,
    rate: 1.0,
  },
};

/**
 * Type des identifiants de sons disponibles
 */
export type SoundKey = keyof typeof soundUrls;

export default soundUrls;
