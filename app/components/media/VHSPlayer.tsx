"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface VHSPlayerProps {
  src: string;
  title?: string;
}

export function VHSPlayer({ src, title = 'PLAY' }: VHSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showGlitch, setShowGlitch] = useState(false);
  const [tracking, setTracking] = useState(0);

  // Timestamp format VHS: HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Effet glitch aléatoire occasionnel
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% de chance
        setShowGlitch(true);
        setTimeout(() => setShowGlitch(false), 150);
      }
    }, 5000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Effet de tracking VHS (décalage vertical aléatoire)
  useEffect(() => {
    const trackingInterval = setInterval(() => {
      if (Math.random() < 0.15) {
        const offset = (Math.random() - 0.5) * 4;
        setTracking(offset);
        setTimeout(() => setTracking(0), 100);
      }
    }, 3000);

    return () => clearInterval(trackingInterval);
  }, []);

  // Met à jour le timestamp
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Video Element */}
      <motion.div
        animate={{ y: tracking }}
        transition={{ duration: 0.05 }}
        className="relative h-full w-full"
      >
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-contain"
          onClick={handlePlayPause}
          playsInline
          preload="metadata"
        />
      </motion.div>

      {/* VHS Scanlines */}
      <div 
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(0, 0, 0, 0.15) 1px,
            rgba(0, 0, 0, 0.15) 2px
          )`
        }}
      />

      {/* VHS Noise Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Glitch Effect */}
      <AnimatePresence>
        {showGlitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-20"
            style={{
              background: 'linear-gradient(90deg, rgba(255,0,0,0.1) 0%, transparent 33%, rgba(0,255,0,0.1) 33%, transparent 66%, rgba(0,0,255,0.1) 66%)',
              mixBlendMode: 'screen',
            }}
          />
        )}
      </AnimatePresence>

      {/* VHS Timestamp - Top Left */}
      <div className="absolute left-3 top-3 z-30 font-mono text-xs md:text-sm">
        <div className="flex items-center gap-2 text-green-400/90 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]">
          <span className="animate-pulse">{isPlaying ? '▶' : '⏸'}</span>
          <span className="tracking-wider">{title}</span>
          <span className="text-white/80">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* VHS Timestamp - Top Right */}
      <div className="absolute right-3 top-3 z-30 font-mono text-xs md:text-sm">
        <div className="text-blue-400/90 drop-shadow-[0_0_4px_rgba(96,165,250,0.5)]">
          <span className="tracking-wider">SP</span>
          <span className="ml-2 text-white/60">--:--:--</span>
        </div>
      </div>

      {/* Play/Pause Overlay (shown when paused) */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40"
          onClick={handlePlayPause}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <svg className="ml-1 h-10 w-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </motion.div>
      )}

      {/* VHS Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-3">
        {/* Progress Bar */}
        <div className="mb-2 h-1 w-full rounded-full bg-white/20">
          <div 
            className="h-full rounded-full bg-white/60 transition-all duration-100"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between text-xs font-mono text-white/70">
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePlayPause}
              className="rounded p-1 hover:bg-white/10 transition-colors"
            >
              {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <span>STOP</span>
            <span>REW</span>
            <span>FF</span>
          </div>
          <div className="text-right">
            <span className="text-yellow-400/80">CH 03</span>
          </div>
        </div>
      </div>

      {/* VHS Tracking Lines (occasional horizontal lines) */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <motion.div
          animate={{
            y: [0, '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute left-0 right-0 h-px bg-white/10"
        />
      </div>
    </div>
  );
}
