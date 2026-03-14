"use client";

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Media, MediaType, getMediaByType } from '@/app/lib/uploadthing';
import { downloadFile, downloadFilesAsZip } from '@/app/lib/downloadUtils';
import { MediaCard } from './MediaCard';
import { MediaViewer } from './MediaViewer';

export interface GalleryGridProps {
  type: MediaType;
}

export function GalleryGrid({ type }: GalleryGridProps) {
  const [mediaList] = useState<Media[]>(() => getMediaByType(type));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Sélection
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Progression téléchargement groupé
  const [dlState, setDlState] = useState<{ active: boolean; done: number; total: number }>({
    active: false, done: 0, total: 0,
  });

  const selectedMedia = selectedIndex !== null ? mediaList[selectedIndex] : null;

  /* ---- Navigation viewer ---- */
  const handleOpenViewer = useCallback((index: number) => setSelectedIndex(index), []);
  const handleCloseViewer = useCallback(() => setSelectedIndex(null), []);
  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => prev !== null && prev < mediaList.length - 1 ? prev + 1 : 0);
  }, [mediaList.length]);
  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => prev !== null && prev > 0 ? prev - 1 : mediaList.length - 1);
  }, [mediaList.length]);

  /* ---- Sélection ---- */
  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((v) => !v);
    setSelectedIds(new Set());
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => setSelectedIds(new Set(mediaList.map((m) => m.id))), [mediaList]);
  const selectNone = useCallback(() => setSelectedIds(new Set()), []);

  /* ---- Téléchargements ---- */
  const handleDownloadOne = useCallback(async (media: Media) => {
    await downloadFile(media);
  }, []);

  const handleDownloadSelected = useCallback(async () => {
    const files = mediaList.filter((m) => selectedIds.has(m.id));
    if (files.length === 0) return;
    if (files.length === 1) { await downloadFile(files[0]); return; }
    setDlState({ active: true, done: 0, total: files.length });
    await downloadFilesAsZip(files, `gallery-${type}.zip`, (done, total) =>
      setDlState({ active: true, done, total })
    );
    setDlState({ active: false, done: 0, total: 0 });
  }, [mediaList, selectedIds, type]);

  const handleDownloadAll = useCallback(async () => {
    if (mediaList.length === 0) return;
    if (mediaList.length === 1) { await downloadFile(mediaList[0]); return; }
    setDlState({ active: true, done: 0, total: mediaList.length });
    await downloadFilesAsZip(mediaList, `gallery-${type}.zip`, (done, total) =>
      setDlState({ active: true, done, total })
    );
    setDlState({ active: false, done: 0, total: 0 });
  }, [mediaList, type]);

  /* ---- Couleurs par type ---- */
  const typeColor = { photos: '#00ff55', gif: '#ffaa00', videos: '#ff3333' }[type];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  if (mediaList.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg text-gray-400">Aucun média disponible</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      {/* Toolbar téléchargement / sélection */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* Bouton tout télécharger (mode normal) */}
        {!isSelectMode && (
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={dlState.active}
            className="flex items-center gap-2 border px-3 py-1.5 font-mono text-sm transition-colors disabled:opacity-40"
            style={{ borderColor: typeColor, color: typeColor }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            TOUT TÉLÉCHARGER ({mediaList.length})
          </button>
        )}

        {/* Toggle mode sélection */}
        <button
          type="button"
          onClick={toggleSelectMode}
          className="flex items-center gap-2 border px-3 py-1.5 font-mono text-sm transition-colors"
          style={{
            borderColor: isSelectMode ? '#ff3333' : typeColor,
            color: isSelectMode ? '#ff3333' : typeColor,
          }}
        >
          {isSelectMode ? '[ ANNULER ]' : '[ SÉLECTIONNER ]'}
        </button>

        {/* Contrôles mode sélection */}
        {isSelectMode && (
          <>
            <button type="button" onClick={selectAll} className="border border-white/30 px-3 py-1.5 font-mono text-sm text-white/60 hover:text-white transition-colors">
              TOUT
            </button>
            <button type="button" onClick={selectNone} className="border border-white/30 px-3 py-1.5 font-mono text-sm text-white/60 hover:text-white transition-colors">
              AUCUN
            </button>
            <button
              type="button"
              onClick={handleDownloadSelected}
              disabled={selectedIds.size === 0 || dlState.active}
              className="flex items-center gap-2 border px-3 py-1.5 font-mono text-sm transition-colors disabled:opacity-40"
              style={{ borderColor: typeColor, color: typeColor, backgroundColor: selectedIds.size > 0 ? `${typeColor}18` : 'transparent' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              TÉLÉCHARGER ({selectedIds.size})
            </button>
          </>
        )}

        {/* Barre de progression */}
        {dlState.active && (
          <span className="ml-2 font-mono text-xs" style={{ color: typeColor }}>
            [{Array.from({ length: 10 }, (_, i) => i < Math.round((dlState.done / dlState.total) * 10) ? '█' : '░').join('')}] {dlState.done}/{dlState.total}
          </span>
        )}
      </div>

      {/* Grid */}
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
              isSelected={selectedIds.has(media.id)}
              isSelectMode={isSelectMode}
              onSelect={() => toggleItem(media.id)}
              onDownload={() => handleDownloadOne(media)}
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

      {/* Footer info */}
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
