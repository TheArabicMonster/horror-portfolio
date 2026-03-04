"use client";

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Media, MediaType, getMediaByType } from '@/app/lib/uploadthing';
import { MediaCard } from './MediaCard';
import { MediaViewer } from './MediaViewer';

export interface GalleryGridProps {
  type: MediaType;
}

export function GalleryGrid({ type }: GalleryGridProps) {
  const [mediaList] = useState<Media[]>(() => getMediaByType(type));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedMedia = selectedIndex !== null ? mediaList[selectedIndex] : null;

  const handleOpenViewer = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => 
      prev !== null && prev < mediaList.length - 1 ? prev + 1 : 0
    );
  }, [selectedIndex, mediaList.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => 
      prev !== null && prev > 0 ? prev - 1 : mediaList.length - 1
    );
  }, [selectedIndex, mediaList.length]);

  // Animation variants pour la grille
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  // Empty state
  if (mediaList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] items-center justify-center"
      >
        <div className="text-center">
          <svg 
            className="mx-auto mb-4 h-16 w-16 text-gray-600" 
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
          <p className="text-lg text-gray-400">Aucun média disponible</p>
          <p className="mt-2 text-sm text-gray-600">
            Les {type} seront ajoutées prochainement
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {mediaList.map((media, index) => (
          <motion.div key={media.id} variants={itemVariants}>
            <MediaCard
              media={media}
              onClick={() => handleOpenViewer(index)}
              index={index}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={handleCloseViewer}
          onNext={mediaList.length > 1 ? handleNext : undefined}
          onPrev={mediaList.length > 1 ? handlePrev : undefined}
        />
      )}

      {/* Grid Info Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex items-center justify-center gap-4 text-sm text-gray-500"
      >
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500/50" />
          {mediaList.length} {mediaList.length === 1 ? 'élément' : 'éléments'}
        </span>
        <span>|</span>
        <span className="capitalize">{type}</span>
      </motion.div>
    </>
  );
}
