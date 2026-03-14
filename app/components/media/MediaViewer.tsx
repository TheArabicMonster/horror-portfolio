"use client";

/**
 * @file MediaViewer.tsx
 * @description Visionneuse de médias avec intégration AppContext
 * @author Agent 2 - UI Components / Agent 6 - Routing & State Management
 * 
 * INTÉGRATION:
 * - Connecte avec AppContext pour navigation
 * - onNext/onPrev utilisent les fonctions du context si disponibles
 * - onClose appelle closeMedia() du context
 */

import { useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Media, MediaType } from '@/app/lib/uploadthing';
import { VHSPlayer } from './VHSPlayer';
import { useOptionalAppContext } from '@/app/context/AppContext';
import { useOptionalAudioContext } from '@/app/context/AudioContext';

export interface MediaViewerProps {
  media: Media;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

/**
 * Visionneuse de médias avec cadre CRT
 * Supporte images et vidéos (via VHSPlayer)
 * 
 * Intégration AppContext:
 * - Si les callbacks ne sont pas fournis, utilise AppContext
 * - Navigation automatique via nextMedia/prevMedia
 */
export function MediaViewer({ media, onClose, onNext, onPrev }: MediaViewerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const isVideo = media.type === 'videos';
  
  // Accès aux contextes optionnels
  const appContext = useOptionalAppContext();
  const audioContext = useOptionalAudioContext();

  // Détermine les fonctions de navigation
  // Priorité aux props, sinon AppContext
  const handleNext = useCallback(() => {
    if (onNext) {
      onNext();
    } else if (appContext) {
      appContext.nextMedia();
    }
    audioContext?.playHoverBeep?.();
  }, [onNext, appContext, audioContext]);

  const handlePrev = useCallback(() => {
    if (onPrev) {
      onPrev();
    } else if (appContext) {
      appContext.prevMedia();
    }
    audioContext?.playHoverBeep?.();
  }, [onPrev, appContext, audioContext]);

  const handleClose = useCallback(() => {
    onClose();
    audioContext?.playBeep?.();
  }, [onClose, audioContext]);

  // Gestion des touches clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case 'ArrowRight':
        if (onNext || (appContext?.state.currentMediaList?.length ?? 0) > 1) {
          handleNext();
        }
        break;
      case 'ArrowLeft':
        if (onPrev || (appContext?.state.currentMediaList?.length ?? 0) > 1) {
          handlePrev();
        }
        break;
    }
  }, [handleClose, handleNext, handlePrev, onNext, onPrev, appContext?.state.currentMediaList]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    // Empêche le scroll du body
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // Détermine si la navigation est disponible
  const canNavigate = !!(onNext || (appContext?.state.currentMediaList?.length ?? 0) > 1);

  return (
    <motion.div
      key="mediaviewer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      {/* Content Container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CRT Frame */}
        <div className="relative">
          {/* Outer CRT border */}
          <div className="rounded-lg bg-gray-800 p-4 shadow-2xl">
            {/* Inner screen bezel */}
            <div className="relative overflow-hidden rounded bg-black p-2">
              {/* Screen glow effect */}
              <div className="pointer-events-none absolute inset-0 rounded bg-gradient-to-br from-white/5 to-transparent" />
              
              {/* Scanlines overlay */}
              <div 
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  background: `repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 0, 0, 0.3) 2px,
                    rgba(0, 0, 0, 0.3) 4px
                  )`
                }}
              />

              {/* Media Content */}
              <div className="relative aspect-video w-[90vw] max-w-[900px] overflow-hidden">
                {isVideo ? (
                  <VHSPlayer src={media.url} title={media.title} />
                ) : imageError ? (
                  <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-500">
                    <div className="text-center">
                      <svg 
                        className="mx-auto mb-4 h-16 w-16" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      <p>Image non disponible</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 animate-pulse bg-gray-800" />
                    )}
                    <Image
                      src={media.url}
                      alt={media.title}
                      fill
                      className="object-contain"
                      sizes="90vw"
                      priority
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                    />
                  </>
                )}
              </div>

              {/* CRT corner accents */}
              <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-gray-600" />
              <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-gray-600" />
              <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-gray-600" />
              <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-gray-600" />
            </div>

            {/* Title below screen */}
            <div className="mt-3 text-center">
              <p className="font-mono text-sm tracking-wider text-gray-400">
                {media.title}
              </p>
              <p className="mt-1 font-mono text-xs text-gray-600">
                {media.type.toUpperCase()} // ID: {media.id.slice(0, 6)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={handleClose}
        className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110"
        aria-label="Fermer"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Navigation Buttons */}
      {canNavigate && (
        <>
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 md:left-8"
            aria-label="Précédent"
          >
            <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 md:right-8"
            aria-label="Suivant"
          >
            <svg className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </>
      )}

      {/* Keyboard hints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex items-center gap-4 text-xs text-white/40"
      >
        {canNavigate && (
          <span className="flex items-center gap-1">
            <kbd className="rounded bg-white/10 px-2 py-1 font-mono">←</kbd>
            <kbd className="rounded bg-white/10 px-2 py-1 font-mono">→</kbd>
            <span className="ml-1">Naviguer</span>
          </span>
        )}
        <span className="flex items-center gap-1">
          <kbd className="rounded bg-white/10 px-2 py-1 font-mono">ESC</kbd>
          <span className="ml-1">Fermer</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

export default MediaViewer;
