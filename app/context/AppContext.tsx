"use client";

/**
 * @file AppContext.tsx
 * @description Context global pour la gestion du state et de la navigation
 * @author Agent 6 - Routing & State Management
 * 
 * Fournit:
 * - État global de l'application (boot, vue courante, média sélectionné)
 * - Navigation programmatique entre les vues
 * - Gestion des transitions et glitch mode
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Media, MediaType } from "@/app/lib/uploadthing";

// ============================================================================
// TYPES
// ============================================================================

/** États possibles du système */
type SystemStatus = "online" | "glitch" | "warning";

/** Vues possibles de l'application */
type AppView = "boot" | "hub" | "gallery" | "viewer";

/** Interface du state global */
interface AppState {
  /** Boot sequence terminé */
  booted: boolean;
  /** Vue courante */
  currentView: AppView;
  /** Catégorie de média sélectionnée */
  selectedCategory: MediaType | null;
  /** Média actuellement visionné */
  selectedMedia: Media | null;
  /** État du système */
  systemStatus: SystemStatus;
  /** Index du média dans la liste courante (pour navigation) */
  currentMediaIndex: number | null;
  /** Liste des médias de la catégorie courante */
  currentMediaList: Media[];
}

/** Actions pour le reducer */
type AppAction =
  | { type: "BOOT_COMPLETE" }
  | { type: "ENTER_HUB" }
  | { type: "OPEN_GALLERY"; payload: MediaType }
  | { type: "OPEN_MEDIA"; payload: { media: Media; index: number; list: Media[] } }
  | { type: "CLOSE_MEDIA" }
  | { type: "CLOSE_GALLERY" }
  | { type: "SET_GLITCH_MODE" }
  | { type: "SET_SYSTEM_STATUS"; payload: SystemStatus }
  | { type: "NEXT_MEDIA" }
  | { type: "PREV_MEDIA" };

/** Interface du contexte */
interface AppContextType {
  /** State actuel */
  state: AppState;
  /** Fin du boot → hub */
  boot: () => void;
  /** Va au hub 3D */
  enterHub: () => void;
  /** Ouvre une galerie */
  openGallery: (type: MediaType) => void;
  /** Ouvre le viewer pour un média */
  openMedia: (media: Media, index?: number, list?: Media[]) => void;
  /** Ferme le viewer */
  closeMedia: () => void;
  /** Retourne au hub depuis la galerie */
  closeGallery: () => void;
  /** Active le mode glitch */
  setGlitchMode: () => void;
  /** Navigue vers média suivant */
  nextMedia: () => void;
  /** Navigue vers média précédent */
  prevMedia: () => void;
  /** Définit le statut système */
  setSystemStatus: (status: SystemStatus) => void;
}

// ============================================================================
// STATE INITIAL
// ============================================================================

const initialState: AppState = {
  booted: false,
  currentView: "boot",
  selectedCategory: null,
  selectedMedia: null,
  systemStatus: "online",
  currentMediaIndex: null,
  currentMediaList: [],
};

// ============================================================================
// REDUCER
// ============================================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "BOOT_COMPLETE":
      return {
        ...state,
        booted: true,
        currentView: "hub",
        systemStatus: "online",
      };

    case "ENTER_HUB":
      return {
        ...state,
        currentView: "hub",
        selectedCategory: null,
        selectedMedia: null,
        currentMediaIndex: null,
      };

    case "OPEN_GALLERY":
      return {
        ...state,
        currentView: "gallery",
        selectedCategory: action.payload,
        selectedMedia: null,
        currentMediaIndex: null,
      };

    case "OPEN_MEDIA":
      return {
        ...state,
        currentView: "viewer",
        selectedMedia: action.payload.media,
        currentMediaIndex: action.payload.index,
        currentMediaList: action.payload.list,
      };

    case "CLOSE_MEDIA":
      // Si on était en galerie, on retourne à la galerie
      // Sinon on retourne au hub
      const returnView = state.selectedCategory ? "gallery" : "hub";
      return {
        ...state,
        currentView: returnView,
        selectedMedia: null,
        currentMediaIndex: null,
      };

    case "CLOSE_GALLERY":
      return {
        ...state,
        currentView: "hub",
        selectedCategory: null,
        selectedMedia: null,
        currentMediaIndex: null,
        currentMediaList: [],
      };

    case "SET_GLITCH_MODE":
      return {
        ...state,
        systemStatus: state.systemStatus === "glitch" ? "online" : "glitch",
      };

    case "SET_SYSTEM_STATUS":
      return {
        ...state,
        systemStatus: action.payload,
      };

    case "NEXT_MEDIA": {
      if (
        state.currentMediaIndex === null ||
        state.currentMediaList.length === 0
      ) {
        return state;
      }
      const nextIndex =
        state.currentMediaIndex < state.currentMediaList.length - 1
          ? state.currentMediaIndex + 1
          : 0;
      return {
        ...state,
        currentMediaIndex: nextIndex,
        selectedMedia: state.currentMediaList[nextIndex],
      };
    }

    case "PREV_MEDIA": {
      if (
        state.currentMediaIndex === null ||
        state.currentMediaList.length === 0
      ) {
        return state;
      }
      const prevIndex =
        state.currentMediaIndex > 0
          ? state.currentMediaIndex - 1
          : state.currentMediaList.length - 1;
      return {
        ...state,
        currentMediaIndex: prevIndex,
        selectedMedia: state.currentMediaList[prevIndex],
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Provider pour le state global de l'application
 * Gère la navigation et les transitions entre les vues
 */
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const router = useRouter();

  // -------------------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------------------

  /** Boot terminé → redirection vers /hub */
  const boot = useCallback(() => {
    dispatch({ type: "BOOT_COMPLETE" });
    router.push("/hub");
  }, [router]);

  /** Navigation vers le hub */
  const enterHub = useCallback(() => {
    dispatch({ type: "ENTER_HUB" });
    router.push("/hub");
  }, [router]);

  /** Ouvre une galerie par type */
  const openGallery = useCallback(
    (type: MediaType) => {
      dispatch({ type: "OPEN_GALLERY", payload: type });
      router.push(`/gallery/${type}`);
    },
    [router]
  );

  /** Ouvre le viewer pour un média spécifique */
  const openMedia = useCallback(
    (media: Media, index?: number, list?: Media[]) => {
      dispatch({
        type: "OPEN_MEDIA",
        payload: {
          media,
          index: index ?? 0,
          list: list ?? [media],
        },
      });
    },
    []
  );

  /** Ferme le viewer de média */
  const closeMedia = useCallback(() => {
    dispatch({ type: "CLOSE_MEDIA" });
  }, []);

  /** Retourne au hub depuis la galerie */
  const closeGallery = useCallback(() => {
    dispatch({ type: "CLOSE_GALLERY" });
    router.push("/hub");
  }, [router]);

  /** Active/désactive le mode glitch */
  const setGlitchMode = useCallback(() => {
    dispatch({ type: "SET_GLITCH_MODE" });
  }, []);

  /** Définit le statut du système */
  const setSystemStatus = useCallback((status: SystemStatus) => {
    dispatch({ type: "SET_SYSTEM_STATUS", payload: status });
  }, []);

  /** Média suivant dans la liste */
  const nextMedia = useCallback(() => {
    dispatch({ type: "NEXT_MEDIA" });
  }, []);

  /** Média précédent dans la liste */
  const prevMedia = useCallback(() => {
    dispatch({ type: "PREV_MEDIA" });
  }, []);

  // -------------------------------------------------------------------------
  // VALUE
  // -------------------------------------------------------------------------

  const value: AppContextType = {
    state,
    boot,
    enterHub,
    openGallery,
    openMedia,
    closeMedia,
    closeGallery,
    setGlitchMode,
    setSystemStatus,
    nextMedia,
    prevMedia,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook pour accéder au contexte applicatif
 * @throws {Error} Si utilisé hors d'un AppProvider
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(
      "useAppContext doit être utilisé à l'intérieur d'un AppProvider"
    );
  }
  return context;
}

/**
 * Hook sécurisé qui retourne undefined si hors du provider
 * Utile pour des vérifications conditionnelles
 */
export function useOptionalAppContext(): AppContextType | undefined {
  return useContext(AppContext);
}

export default AppContext;
