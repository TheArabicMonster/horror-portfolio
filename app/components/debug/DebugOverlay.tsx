"use client";

/**
 * @file DebugOverlay.tsx
 * @description Overlay de debug avec stats Three.js et contrôles
 * @author Agent 7 - Debug Tools
 * 
 * Affiche:
 * - FPS counter (requestAnimationFrame)
 * - Stats Three.js (draw calls, memory)
 * - Toggle wireframe
 * - Toggle lights
 * - Info position caméra
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useThree } from "@react-three/fiber";

interface DebugStats {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memory: number;
}

/**
 * Hook pour tracker les FPS
 */
function useFPS(): number {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let rafId: number;
    
    const updateFPS = () => {
      frameCount.current++;
      const now = performance.now();
      const delta = now - lastTime.current;
      
      if (delta >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / delta));
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      rafId = requestAnimationFrame(updateFPS);
    };
    
    rafId = requestAnimationFrame(updateFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return fps;
}

/**
 * Hook pour récupérer les stats Three.js
 */
function useThreeStats(): DebugStats {
  const { gl, scene } = useThree();
  const [stats, setStats] = useState<DebugStats>({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    memory: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const info = gl.info;
      setStats({
        fps: 0, // Mis à jour séparément
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        memory: Math.round(
          (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize 
            ? (performance as unknown as { memory: { usedJSHeapSize: number } }).memory.usedJSHeapSize / 1048576 
            : 0
        ),
      });
    }, 500);

    return () => clearInterval(interval);
  }, [gl]);

  return stats;
}

/**
 * Hook pour suivre la position de la caméra
 */
function useCameraPosition(): { position: string; rotation: string } {
  const { camera } = useThree();
  const [info, setInfo] = useState({ position: "", rotation: "" });

  useEffect(() => {
    const interval = setInterval(() => {
      const p = camera.position;
      const r = camera.rotation;
      setInfo({
        position: `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`,
        rotation: `${(r.x * 180 / Math.PI).toFixed(1)}°, ${(r.y * 180 / Math.PI).toFixed(1)}°, ${(r.z * 180 / Math.PI).toFixed(1)}°`,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [camera]);

  return info;
}

/**
 * Composant interne pour les stats Three.js (doit être dans Canvas)
 */
function ThreeStatsPanel({ 
  wireframe, 
  setWireframe,
  lightsEnabled,
  setLightsEnabled,
}: {
  wireframe: boolean;
  setWireframe: (v: boolean) => void;
  lightsEnabled: boolean;
  setLightsEnabled: (v: boolean) => void;
}): React.ReactNode {
  const stats = useThreeStats();
  const cameraInfo = useCameraPosition();
  const fps = useFPS();
  const { scene } = useThree();

  // Applique le wireframe à tous les meshes
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) 
          ? child.material 
          : [child.material];
        materials.forEach((mat) => {
          mat.wireframe = wireframe;
        });
      }
    });
  }, [wireframe, scene]);

  // Toggle lights
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        child.visible = lightsEnabled;
      }
    });
  }, [lightsEnabled, scene]);

  // Met à jour le DOM avec les stats
  useEffect(() => {
    const panel = document.getElementById("three-stats-panel");
    if (panel) {
      panel.innerHTML = `
        <div style="color: ${fps < 30 ? '#ff4444' : fps < 50 ? '#ffaa00' : '#44ff44'}; font-weight: bold;">
          FPS: ${fps}
        </div>
        <div>Draw Calls: ${stats.drawCalls}</div>
        <div>Triangles: ${stats.triangles.toLocaleString()}</div>
        <div>Geometries: ${stats.geometries}</div>
        <div>Textures: ${stats.textures}</div>
        <div>Memory: ${stats.memory} MB</div>
        <div style="margin-top: 8px; border-top: 1px solid #444; padding-top: 8px;">
          <div>Cam Pos: ${cameraInfo.position}</div>
          <div>Cam Rot: ${cameraInfo.rotation}</div>
        </div>
      `;
    }
  }, [stats, fps, cameraInfo]);

  return null;
}

import * as THREE from "three";

/**
 * Overlay de debug complet
 */
export function DebugOverlay({ 
  isVisible,
  onToggle,
}: { 
  isVisible: boolean;
  onToggle?: () => void;
}): React.JSX.Element | null {
  const [wireframe, setWireframe] = useState(false);
  const [lightsEnabled, setLightsEnabled] = useState(true);
  const [showAxes, setShowAxes] = useState(false);

  const toggleWireframe = useCallback(() => {
    setWireframe(prev => !prev);
  }, []);

  const toggleLights = useCallback(() => {
    setLightsEnabled(prev => !prev);
  }, []);

  const toggleAxes = useCallback(() => {
    setShowAxes(prev => !prev);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Panneau de stats HTML */}
      <div 
        className="fixed top-8 left-4 z-[9996] p-4 font-mono text-xs rounded pointer-events-auto"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          color: "#00ff00",
          border: "1px solid #00ff00",
          minWidth: "200px",
        }}
      >
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-green-800">
          <span className="font-bold">🔧 DEBUG MODE</span>
          {onToggle && (
            <button 
              onClick={onToggle}
              className="text-red-400 hover:text-red-300 px-1"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Stats Three.js */}
        <div id="three-stats-panel" className="space-y-1 mb-4">
          <div>Loading...</div>
        </div>
        
        {/* Contrôles */}
        <div className="space-y-2 border-t border-green-800 pt-3">
          <div className="text-gray-400 text-xs mb-1">CONTROLS:</div>
          
          <button
            onClick={toggleWireframe}
            className={`w-full px-2 py-1 text-left rounded text-xs transition-colors ${
              wireframe 
                ? "bg-green-900 text-green-300" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            [ ] Wireframe: {wireframe ? "ON" : "OFF"}
          </button>
          
          <button
            onClick={toggleLights}
            className={`w-full px-2 py-1 text-left rounded text-xs transition-colors ${
              lightsEnabled 
                ? "bg-green-900 text-green-300" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            [ ] Lights: {lightsEnabled ? "ON" : "OFF"}
          </button>
          
          <button
            onClick={toggleAxes}
            className={`w-full px-2 py-1 text-left rounded text-xs transition-colors ${
              showAxes 
                ? "bg-green-900 text-green-300" 
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            [ ] Axes Helper: {showAxes ? "ON" : "OFF"}
          </button>
        </div>
        
        {/* Raccourcis */}
        <div className="mt-3 pt-2 border-t border-green-800 text-xs text-gray-500">
          <div>Shortcuts:</div>
          <div>Ctrl+G: Toggle Glitch</div>
          <div>?debug=true: Force debug</div>
        </div>
      </div>

      {/* Composant Three.js pour les stats internes */}
      <DebugOverlayThree 
        wireframe={wireframe}
        setWireframe={setWireframe}
        lightsEnabled={lightsEnabled}
        setLightsEnabled={setLightsEnabled}
        showAxes={showAxes}
      />
    </>
  );
}

/**
 * Composant Three.js interne pour DebugOverlay
 * Doit être rendu dans le Canvas
 */
function DebugOverlayThree({
  wireframe,
  setWireframe,
  lightsEnabled,
  setLightsEnabled,
  showAxes,
}: {
  wireframe: boolean;
  setWireframe: (v: boolean) => void;
  lightsEnabled: boolean;
  setLightsEnabled: (v: boolean) => void;
  showAxes: boolean;
}): React.JSX.Element {
  const { scene } = useThree();

  // Applique le wireframe
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material) 
          ? child.material 
          : [child.material];
        materials.forEach((mat) => {
          mat.wireframe = wireframe;
        });
      }
    });
  }, [wireframe, scene]);

  // Toggle lights
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        child.visible = lightsEnabled;
      }
    });
  }, [lightsEnabled, scene]);

  return (
    <>
      <ThreeStatsPanel 
        wireframe={wireframe}
        setWireframe={setWireframe}
        lightsEnabled={lightsEnabled}
        setLightsEnabled={setLightsEnabled}
      />
      {showAxes && <axesHelper args={[5]} />}
    </>
  );
}

/**
 * Wrapper pour intégrer DebugOverlay dans un Canvas Three.js
 */
export function DebugOverlayThreeJS(props: { 
  isVisible: boolean;
  wireframe?: boolean;
  showAxes?: boolean;
}): React.JSX.Element | null {
  const [wireframeState, setWireframe] = useState(props.wireframe ?? false);
  const [lightsEnabled, setLightsEnabled] = useState(true);

  if (!props.isVisible) return null;

  return (
    <DebugOverlayThree
      wireframe={wireframeState}
      setWireframe={setWireframe}
      lightsEnabled={lightsEnabled}
      setLightsEnabled={setLightsEnabled}
      showAxes={props.showAxes ?? false}
    />
  );
}

export default DebugOverlay;
