'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface GlitchLoaderProps {
  message?: string;
}

export default function GlitchLoader({ message = 'LOADING...' }: GlitchLoaderProps) {
  console.log('[GlitchLoader] MOUNTED - Loading screen displayed');
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.05 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        style={{
          background: '#000',
        }}
      >
        {/* Effet glitch avec lignes scan */}
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              rgba(0,255,0,0.03) 0px,
              transparent 1px,
              transparent 2px,
              rgba(0,255,0,0.03) 3px
            )`,
            animation: 'scanlines 0.1s linear infinite',
          }}
        />
        
        {/* Texte central */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1 }}
          className="text-center"
        >
          <div
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '48px',
              color: '#00ff41',
              textShadow: '0 0 20px #00ff41',
              letterSpacing: '4px',
              animation: 'glitch 0.3s infinite',
            }}
          >
            {message}
          </div>
          
          {/* Barre de progression glitch */}
          <div
            style={{
              width: '300px',
              height: '4px',
              background: '#111',
              marginTop: '20px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: 'linear' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #00ff41, #fff, #00ff41)',
              }}
            />
          </div>
        </motion.div>
        
        {/* Bruit visuel */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Lignes de glitch */}
        <motion.div
          animate={{
            top: ['0%', '100%', '30%', '70%', '0%'],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="absolute left-0 right-0 h-[2px] bg-[#00ff41] opacity-50"
        />
      </motion.div>
    </AnimatePresence>
  );
}
