/**
 * @file index.ts
 * @description Export de tous les contextes de l'application
 * @author Agent 5 - Audio & Atmosphere / Agent 6 - Routing & State Management
 */

// AppContext - State global et navigation
export {
  AppProvider,
  useAppContext,
  useOptionalAppContext,
} from "./AppContext";

// AudioContext - Gestion audio
export {
  AudioProvider,
  useAudioContext,
  useOptionalAudioContext,
} from "./AudioContext";
