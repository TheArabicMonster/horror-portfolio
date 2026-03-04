/**
 * @file index.ts
 * @description Export de tous les composants UI rétro
 * @author Agent 2 - UI Components
 */

export { default as Scanlines } from "./Scanlines";
export type { ScanlinesProps } from "./Scanlines";

export { default as CRTOverlay } from "./CRTOverlay";
export type { CRTOverlayProps } from "./CRTOverlay";

export { default as TerminalText } from "./TerminalText";
export type { TerminalTextProps, TerminalColor } from "./TerminalText";

export { default as RetroWindow } from "./RetroWindow";
export type { RetroWindowProps } from "./RetroWindow";

export { default as GlitchText } from "./GlitchText";
export type { GlitchTextProps, GlitchIntensity } from "./GlitchText";

export { default as BootSequence } from "./BootSequence";
export type { BootSequenceProps } from "./BootSequence";

export { default as NoiseOverlay, NoiseOverlaySVG } from "./NoiseOverlay";
export type { NoiseOverlayProps } from "./NoiseOverlay";

export { default as AudioToggle } from "./AudioToggle";
export type { AudioToggleProps } from "./AudioToggle";

export { 
  default as WebGLFallback,
  WebGLFallbackScreen,
  WebGLChecker,
  useWebGLSupport,
  isWebGLSupported,
  isWebGL2Supported,
} from "./WebGLFallback";
