'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraZoomEffectProps {
  target: string | null;
}

export default function CameraZoomEffect({ target }: CameraZoomEffectProps) {
  const { camera } = useThree();
  const startPos = useRef(camera.position.clone());
  const startTime = useRef(Date.now());
  
  const targetPositions = {
    illustrations: new THREE.Vector3(4.5, 1, -1.5),
    photos: new THREE.Vector3(4.5, 1, 0),
    videos: new THREE.Vector3(4.5, 1, 1.5),
  };
  
  useFrame(() => {
    if (!target) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / 1.5, 1);
    const eased = progress * progress;
    const targetPos = targetPositions[target as keyof typeof targetPositions];
    camera.position.lerpVectors(startPos.current, targetPos, eased);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 60 + (progress * 30);
      camera.updateProjectionMatrix();
    }
  });
  
  return null;
}
