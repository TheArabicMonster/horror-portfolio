'use client';

import { useState, useEffect } from 'react';

interface Props {
  position: [number, number, number];
  type: 'illustrations' | 'photos' | 'videos';
  label: string;
  color: string;
  isOpening: boolean;
  onOpenComplete: () => void;
}

export default function AnimatedMetalDoor({
  position,
  type,
  label,
  color,
  isOpening,
  onOpenComplete,
}: Props) {
  const [openProgress, setOpenProgress] = useState(0);
  
  useEffect(() => {
    console.log(`[AnimatedMetalDoor ${type}] isOpening:`, isOpening);
    if (isOpening && openProgress < 1) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 2000, 1);
        setOpenProgress(progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onOpenComplete();
        }
      };
      animate();
    }
  }, [isOpening, onOpenComplete, openProgress, type]);
  
  const doorY = openProgress * 3;
  
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      {/* Porte simple sans texte */}
      <mesh position={[0, doorY, 0]}>
        <boxGeometry args={[1.6, 2.4, 0.15]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.7} roughness={0.5} />
      </mesh>
      {/* Indicateur lumineux simple */}
      <mesh position={[0, 1.8, 0.1]}>
        <boxGeometry args={[1.4, 0.15, 0.05]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}
