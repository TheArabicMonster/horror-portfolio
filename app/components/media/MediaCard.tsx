"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Media, MediaType } from '@/app/lib/uploadthing';

export interface MediaCardProps {
  media: Media;
  onClick?: () => void;
  index?: number;
}

export function MediaCard({ media, onClick, index = 0 }: MediaCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isVideo = media.type === 'videos';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
      }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Polaroid Container */}
      <div className="relative bg-white p-3 pb-12 shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
          {/* Loading Skeleton */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 animate-pulse bg-gray-800" />
          )}

          {/* Error State */}
          {hasError ? (
            <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-500">
              <div className="text-center">
                <svg 
                  className="mx-auto mb-2 h-10 w-10" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <span className="text-sm">Image introuvable</span>
              </div>
            </div>
          ) : (
            <Image
              src={isVideo && media.thumbnail ? media.thumbnail : media.url}
              alt={media.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}

          {/* Video Play Icon Overlay */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-300 group-hover:bg-black/50">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm"
              >
                <svg 
                  className="ml-1 h-6 w-6 text-gray-900" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {getTypeLabel(media.type)}
          </div>
        </div>

        {/* Title Label */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="truncate text-center font-serif text-sm text-gray-800">
            {media.title}
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            {new Date().getFullYear()}
          </p>
        </div>
      </div>

      {/* Shadow effect */}
      <div className="absolute -bottom-2 left-4 right-4 h-4 bg-black/20 blur-md transition-all duration-300 group-hover:bg-black/30" />
    </motion.div>
  );
}

function getTypeLabel(type: MediaType): string {
  const labels: Record<MediaType, string> = {
    illustrations: 'Illustration',
    photos: 'Photo',
    videos: 'Vidéo',
  };
  return labels[type];
}
