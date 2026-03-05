'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface TeleportTransitionProps {
  isActive: boolean;
  text?: string;
}

export default function TeleportTransition({ isActive, text }: TeleportTransitionProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          {/* Bruit blanc avec SVG noise */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              opacity: 0.9,
            }}
          />
          {/* Scanlines */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
              opacity: 0.6,
            }}
          />
          {/* Texte */}
          {text && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-horror-terminal font-mono text-2xl tracking-widest"
                style={{ textShadow: '0 0 20px #00ff41' }}
              >
                {text}
              </motion.p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
