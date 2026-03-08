"use client";

/**
 * @file page.tsx
 * @description Page galerie 2D fallback avec gestion via AppContext
 * @author Agent 6 - Routing & State Management
 * 
 * Features:
 * - Récupère type depuis params
 * - GalleryGrid avec médias filtrés
 * - MediaViewer pour visionnage
 * - Bouton retour au hub
 * - Scanlines + CRTOverlay
 */

import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GalleryGrid } from "../../components/media/GalleryGrid";
import { MediaViewer } from "../../components/media";
import { Scanlines, CRTOverlay, TerminalText, GlitchText } from "../../components/ui";
import { useAppContext } from "../../context/AppContext";
import { useOptionalAudioContext } from "../../context/AudioContext";
import { Media, MediaType, getMediaByType } from "../../lib/uploadthing";

/**
 * Page Galerie - Affiche une grille de médias par type
 * Route: /gallery/[type] où type = illustrations | photos | videos
 */
export default function GalleryPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    state, 
    openGallery, 
    openMedia, 
    closeMedia, 
    closeGallery,
    nextMedia,
    prevMedia,
  } = useAppContext();
  
  const audioContext = useOptionalAudioContext();

  // Récupère et valide le type depuis les params
  const type = useMemo(() => {
    const rawType = params.type as string;
    const validTypes: MediaType[] = ["illustrations", "photos", "videos"];
    
    if (validTypes.includes(rawType as MediaType)) {
      return rawType as MediaType;
    }
    return null;
  }, [params.type]);

  // Récupère la liste des médias pour la navigation
  const mediaList = useMemo(() => {
    return type ? getMediaByType(type) : [];
  }, [type]);

  // Synchronise le type avec le state global au montage
  useEffect(() => {
    if (type && state.selectedCategory !== type) {
      openGallery(type);
    }
  }, [type, state.selectedCategory, openGallery]);

  // Gestion du clic sur un média
  const handleMediaClick = useCallback((media: Media, index: number) => {
    openMedia(media, index, mediaList);
    audioContext?.playBeep?.();
  }, [openMedia, mediaList, audioContext]);

  // Gestion du retour au hub
  const handleBackToHub = useCallback(() => {
    console.log("[Gallery] Retour au hub");
    audioContext?.playDoorCreak?.();
    closeGallery();
    // Utilisation de window.location pour forcer la navigation
    window.location.href = "/hub";
  }, [closeGallery, audioContext]);

  // Type invalide - affiche erreur
  if (!type) {
    return (
      <main 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <Scanlines opacity={0.15} />
        <CRTOverlay vignetteIntensity={0.5} curvatureIntensity={0.3} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <GlitchText
            text="[ERREUR 404]"
            color="#ff3333"
            className="text-5xl md:text-7xl font-bold mb-4"
          />
          <p className="text-horror-terminal/70 text-lg mb-6">
            ARCHIVE NON TROUVÉE
          </p>
          <button
            onClick={() => router.push("/hub")}
            className="px-6 py-3 border border-horror-terminal text-horror-terminal hover:bg-horror-terminal/20 transition-colors font-mono"
          >
            [ RETOUR AU HUB ]
          </button>
        </motion.div>
      </main>
    );
  }

  // Couleurs selon le type
  const typeColors = {
    illustrations: "#00ff41",
    photos: "#ffb000",
    videos: "#ff3333",
  };

  const typeColor = typeColors[type];

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* Effets visuels */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <Scanlines opacity={0.12} />
        <CRTOverlay vignetteIntensity={0.4} curvatureIntensity={0.25} flicker />
      </div>

      {/* Header */}
      <header className="relative z-20 p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Bouton retour */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleBackToHub}
            className="flex items-center gap-2 text-horror-terminal/70 hover:text-horror-terminal transition-colors font-mono group"
          >
            <svg 
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>HUB</span>
          </motion.button>

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 
              className="text-3xl md:text-4xl font-bold tracking-wider uppercase"
              style={{ 
                color: typeColor,
                textShadow: `0 0 20px ${typeColor}40`,
                fontFamily: "'VT323', monospace",
              }}
            >
              {type}
            </h1>
            <p className="text-horror-terminal/50 text-xs mt-1 font-mono">
              ARCHIVE SECURE // LEVEL 4 CLEARANCE
            </p>
          </motion.div>

          {/* Info compteur */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-right font-mono text-sm"
          >
            <span style={{ color: typeColor }}>
              {mediaList.length}
            </span>
            <span className="text-horror-terminal/50 ml-2">
              {mediaList.length === 1 ? "FICHIER" : "FICHIERS"}
            </span>
          </motion.div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="relative z-20 p-6">
        <div className="max-w-7xl mx-auto">
          <GalleryGrid type={type} />
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-20 p-6 border-t border-white/10 mt-auto"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-mono text-horror-terminal/40">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-2 py-1 border border-horror-terminal/30 rounded">ESC</kbd>
              {" "}Retour
            </span>
            <span>
              <kbd className="px-2 py-1 border border-horror-terminal/30 rounded">←</kbd>
              <kbd className="px-2 py-1 border border-horror-terminal/30 rounded ml-1">→</kbd>
              {" "}Naviguer
            </span>
          </div>
          <div>
            SEC-{Math.random().toString(36).substring(2, 6).toUpperCase()}
          </div>
        </div>
      </motion.footer>

      {/* MediaViewer Overlay */}
      <AnimatePresence>
        {state.selectedMedia && (
          <div className="fixed inset-0 z-50">
            <MediaViewer
              media={state.selectedMedia}
              onClose={closeMedia}
              onNext={mediaList.length > 1 ? nextMedia : undefined}
              onPrev={mediaList.length > 1 ? prevMedia : undefined}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Mode glitch indicator */}
      {state.systemStatus === "glitch" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="bg-red-500/20 border border-red-500/50 px-4 py-2 rounded">
            <span className="text-red-400 font-mono text-sm animate-pulse">
              ⚠ SIGNAL CORROMPU
            </span>
          </div>
        </motion.div>
      )}
    </motion.main>
  );
}
