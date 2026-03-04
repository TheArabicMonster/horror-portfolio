"use client";

/**
 * @file RetroWindow.tsx
 * @description Fenêtre style Windows 95/98 avec bordure 3D et barre de titre
 * @author Agent 2 - UI Components
 */

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Square, X } from "lucide-react";

/**
 * Props pour le composant RetroWindow
 */
/**
 * Props pour le composant RetroWindow
 */
export interface RetroWindowProps {
  /** Titre de la fenêtre affiché dans la barre de titre */
  title: string;
  /** Contenu de la fenêtre */
  children: ReactNode;
  /** Callback appelé quand la fenêtre est fermée */
  onClose?: () => void;
  /** Callback appelé quand la fenêtre est minimisée */
  onMinimize?: () => void;
  /** Callback appelé quand la fenêtre est maximisée */
  onMaximize?: () => void;
  /** Largeur de la fenêtre */
  width?: string | number;
  /** Hauteur de la fenêtre */
  height?: string | number;
  /** Position initiale X */
  initialX?: number;
  /** Position initiale Y */
  initialY?: number;
  /** Fenêtre active (affecte la couleur de la barre de titre) */
  isActive?: boolean;
  /** Afficher l'icône dans la barre de titre */
  icon?: ReactNode;
  /** Classe CSS additionnelle pour le contenu */
  contentClassName?: string;
  /** Classe CSS additionnelle pour le conteneur */
  className?: string;
  /** Empêcher le redimensionnement */
  noResize?: boolean;
}

/**
 * Fenêtre style Windows 95/98 authentique
 * Avec bordure 3D, boutons de contrôle et barre de titre dégradée
 * 
 * @example
 * ```tsx
 * <RetroWindow
 *   title="SYSTEM.EXE"
 *   width={500}
 *   height={300}
 *   onClose={() => setOpen(false)}
 * >
 *   Contenu de la fenêtre...
 * </RetroWindow>
 * ```
 */
export default function RetroWindow({
  title,
  children,
  onClose,
  onMinimize,
  onMaximize,
  width = 400,
  height = "auto",
  initialX = 0,
  initialY = 0,
  isActive = true,
  icon,
  contentClassName = "",
  className = "",
  noResize = false,
}: RetroWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    onMinimize?.();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  const handleClose = () => {
    onClose?.();
  };

  // Conversion des dimensions en style
  const dimensionStyle = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: initialX, y: initialY }}
      animate={{
        opacity: isMinimized ? 0 : 1,
        scale: isMinimized ? 0.8 : 1,
        x: isMaximized ? 0 : initialX,
        y: isMaximized ? 0 : initialY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`absolute ${className}`}
      style={dimensionStyle}
    >
      {/* Conteneur principal avec bordure 3D Windows 95 */}
      <div
        className="w-full h-full flex flex-col"
        style={{
          background: "#c0c0c0",
          border: "2px solid",
          borderColor: "#fff #000 #000 #fff",
          boxShadow: "inset 1px 1px #dfdfdf, inset -1px -1px #808080, 2px 2px 10px rgba(0,0,0,0.3)",
        }}
      >
        {/* Barre de titre */}
        <div
          className="flex items-center justify-between px-1 py-0.5 select-none cursor-default"
          style={{
            background: isActive
              ? "linear-gradient(90deg, #000080 0%, #1084d0 100%)"
              : "linear-gradient(90deg, #808080 0%, #b5b5b5 100%)",
            color: isActive ? "#fff" : "#c0c0c0",
          }}
        >
          {/* Titre avec icône optionnelle */}
          <div className="flex items-center gap-1 overflow-hidden">
            {icon && (
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {icon}
              </span>
            )}
            <span
              className="font-bold truncate text-sm"
              style={{ fontFamily: "'VT323', monospace" }}
            >
              {title}
            </span>
          </div>

          {/* Boutons de contrôle */}
          <div className="flex items-center gap-1">
            {/* Bouton Minimiser */}
            {onMinimize && (
              <button
                onClick={handleMinimize}
                className="w-4 h-3 flex items-center justify-center transition-all active:translate-y-px"
                style={{
                  background: "#c0c0c0",
                  border: "1px solid",
                  borderColor: "#fff #000 #000 #fff",
                  boxShadow: "inset 1px 1px #dfdfdf, inset -1px -1px #808080",
                }}
                aria-label="Minimiser"
              >
                <Minus size={8} className="text-black" strokeWidth={2} />
              </button>
            )}

            {/* Bouton Maximiser */}
            {!noResize && onMaximize && (
              <button
                onClick={handleMaximize}
                className="w-4 h-3 flex items-center justify-center transition-all active:translate-y-px"
                style={{
                  background: "#c0c0c0",
                  border: "1px solid",
                  borderColor: "#fff #000 #000 #fff",
                  boxShadow: "inset 1px 1px #dfdfdf, inset -1px -1px #808080",
                }}
                aria-label="Maximiser"
              >
                <Square size={6} className="text-black" strokeWidth={2} />
              </button>
            )}

            {/* Bouton Fermer */}
            {onClose && (
              <button
                onClick={handleClose}
                className="w-4 h-3 flex items-center justify-center transition-all active:translate-y-px"
                style={{
                  background: "#c0c0c0",
                  border: "1px solid",
                  borderColor: "#fff #000 #000 #fff",
                  boxShadow: "inset 1px 1px #dfdfdf, inset -1px -1px #808080",
                }}
                aria-label="Fermer"
              >
                <X size={8} className="text-black" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Contenu de la fenêtre */}
        <div
          className={`flex-1 overflow-auto p-2 ${contentClassName}`}
          style={{
            background: "#0a0a0a",
            border: "2px solid",
            borderColor: "#808080 #fff #fff #808080",
            margin: "2px",
          }}
        >
          <AnimatePresence mode="wait">
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

