import React, { useRef, useEffect, useCallback } from "react";
import { WebGLRenderer } from "../simulation/WebGLRenderer";
import { ParticleSystem } from "../simulation/ParticleSystem";
import { Camera } from "../simulation/Camera";
import { InputHandler } from "../simulation/InputHandler";

interface ParticleCanvasProps {
  particleCount: number;
  colorCount: number;
  sensingRadius: number;
  forceScale: number;
  maxSpeed: number;
  damping: number;
  colorMatrix: number[][];
  onFpsUpdate?: (fps: number) => void;
}

export const Canvas: React.FC<ParticleCanvasProps> = ({
  particleCount,
  colorCount,
  sensingRadius,
  forceScale,
  maxSpeed,
  damping,
  colorMatrix,
  onFpsUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const animationIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frameCount: 0, lastTime: 0, fps: 0 });

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update renderer
    if (rendererRef.current) {
      rendererRef.current.resize(canvas.width, canvas.height);
    }

    // Update camera screen size
    if (cameraRef.current) {
      cameraRef.current.setScreenSize(canvas.width, canvas.height);
    }
  }, []);

  // FPS calculation
  const updateFps = useCallback(
    (currentTime: number) => {
      const counter = fpsCounterRef.current;
      counter.frameCount++;

      if (currentTime - counter.lastTime >= 1000) {
        counter.fps = Math.round(
          (counter.frameCount * 1000) / (currentTime - counter.lastTime),
        );
        counter.frameCount = 0;
        counter.lastTime = currentTime;

        if (onFpsUpdate) {
          onFpsUpdate(counter.fps);
        }
      }
    },
    [onFpsUpdate],
  );

  // Update particle system when relevant props change
  useEffect(() => {
    if (!particleSystemRef.current) return;

    // Update color matrix
    for (let i = 0; i < colorCount; i++) {
      for (let j = 0; j < colorCount; j++) {
        particleSystemRef.current.setColorRule(i, j, colorMatrix[i][j]);
      }
    }

    // Update other parameters
    particleSystemRef.current.setSensingRadius(sensingRadius);
    // TODO: Add these methods to ParticleSystem if needed
    // particleSystemRef.current.setForceScale(forceScale);
    // particleSystemRef.current.setMaxSpeed(maxSpeed);
    // particleSystemRef.current.setDamping(damping);
  }, [colorMatrix, sensingRadius, forceScale, maxSpeed, damping, colorCount]);

  // Initialize and recreate particle system when particle count or color count changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    handleResize();

    try {
      // Initialize camera first
      cameraRef.current = new Camera(0, 0, 1.0);
      cameraRef.current.setScreenSize(canvas.width, canvas.height);
      cameraRef.current.setZoomConstraints(0.1, 10.0);

      // Initialize WebGL renderer
      rendererRef.current = new WebGLRenderer(canvas);
      rendererRef.current.resize(canvas.width, canvas.height);

      // Initialize particle system
      const worldSize = Math.max(canvas.width, canvas.height) * 4;
      particleSystemRef.current = new ParticleSystem({
        particleCount,
        worldSize: { width: worldSize, height: worldSize },
        colorCount,
        sensingRadius,
        betaDistance: 15,
      });

      // Apply the color matrix
      for (let i = 0; i < colorCount; i++) {
        for (let j = 0; j < colorCount; j++) {
          particleSystemRef.current.setColorRule(i, j, colorMatrix[i][j]);
        }
      }

      // Initialize input handler
      inputHandlerRef.current = new InputHandler(cameraRef.current, canvas);

      console.log("All systems initialized successfully");
    } catch (error) {
      console.error("Failed to initialize systems:", error);
      return;
    }

    // Animation loop
    const animate = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        0.1,
      );
      lastTimeRef.current = currentTime;

      // Update FPS
      updateFps(currentTime);

      if (
        particleSystemRef.current &&
        rendererRef.current &&
        cameraRef.current
      ) {
        // Update particle physics
        particleSystemRef.current.update(deltaTime);

        // Get camera transform data
        const cameraTransform = cameraRef.current.getTransformUniforms();

        // Render particles with camera transformation
        rendererRef.current.render(
          particleSystemRef.current.positions,
          particleSystemRef.current.colors,
          particleSystemRef.current.sizes,
          particleCount,
          cameraTransform.cameraPosition,
          cameraTransform.cameraZoom,
        );
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    lastTimeRef.current = performance.now();
    fpsCounterRef.current.lastTime = performance.now();
    animationIdRef.current = requestAnimationFrame(animate);

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", handleResize);

      if (inputHandlerRef.current) {
        inputHandlerRef.current.dispose();
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [particleCount, colorCount, handleResize, updateFps]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!cameraRef.current) return;

      switch (event.key) {
        case "r":
        case "R":
          cameraRef.current.reset();
          break;
        case "=":
        case "+":
          cameraRef.current.setZoom(cameraRef.current.zoom * 1.2);
          break;
        case "-":
        case "_":
          cameraRef.current.setZoom(cameraRef.current.zoom / 1.2);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "grab",
      }}
    />
  );
};
