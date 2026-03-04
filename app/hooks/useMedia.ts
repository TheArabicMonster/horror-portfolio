"use client";

import { useState, useCallback, useMemo } from 'react';
import {
  Media,
  MediaType,
  getAllMedia,
  getMediaByType,
  getMediaById,
  getRandomMedia,
} from '@/app/lib/uploadthing';

interface UseMediaReturn {
  /** Liste des médias filtrés */
  media: Media[];
  /** Récupère un média aléatoire */
  getRandomMedia: () => Media;
  /** Recherche un média par ID */
  getMediaById: (id: string) => Media | undefined;
  /** Recharge la liste des médias */
  refreshMedia: () => void;
}

export function useMedia(type?: MediaType): UseMediaReturn {
  // State pour forcer un refresh si nécessaire
  const [, setRefreshKey] = useState(0);

  // Mémoise la liste des médias
  const media = useMemo(() => {
    return type ? getMediaByType(type) : getAllMedia();
  }, [type]);

  // Fonction pour obtenir un média aléatoire
  const getRandom = useCallback((): Media => {
    return getRandomMedia(type);
  }, [type]);

  // Fonction pour chercher par ID
  const findById = useCallback((id: string): Media | undefined => {
    return getMediaById(id);
  }, []);

  // Force un refresh du state
  const refreshMedia = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    media,
    getRandomMedia: getRandom,
    getMediaById: findById,
    refreshMedia,
  };
}
