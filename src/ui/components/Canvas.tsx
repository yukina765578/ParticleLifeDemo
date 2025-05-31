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

    console.log(
      "Resize called - setting canvas size to:",
      window.innerWidth,
      "x",
      window.innerHeight,
    );

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update renderer
    if (rendererRef.current) {
      rendererRef.current.resize(canvas.width, canvas.height);
      console.log("Renderer resized");
    }

    // Update camera screen size
    if (cameraRef.current) {
      cameraRef.current.setScreenSize(canvas.width, canvas.height);
      console.log("Camera screen size updated");
    }
  }, []);

  // FPS calculation
  const updateFps = useCallback(
    (currentTime: number) => {
      const counter = fpsCounterRef.current;
      counter.frameCount++;

      if (currentTime - counter.lastTime >= 1000) {
        // Update every second
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

      // Set initial resolution uniform
      rendererRef.current.resize(canvas.width, canvas.height);

      // Initialize particle system with large world and passed parameters
      const worldSize = Math.max(canvas.width, canvas.height) * 4; // 4x screen size
      particleSystemRef.current = new ParticleSystem({
        particleCount,
        worldSize: { width: worldSize, height: worldSize },
        colorCount,
        sensingRadius,
        betaDistance: 15, // Keep default for now
      });

      // Apply the color matrix from props
      if (colorMatrix && particleSystemRef.current) {
        for (let i = 0; i < colorCount; i++) {
          for (let j = 0; j < colorCount; j++) {
            if (colorMatrix[i] && colorMatrix[i][j] !== undefined) {
              particleSystemRef.current.setColorRule(i, j, colorMatrix[i][j]);
            }
          }
        }
      }

      // Apply advanced settings
      if (particleSystemRef.current) {
        particleSystemRef.current.setSensingRadius(sensingRadius);
        // Note: You'll need to add these methods to ParticleSystem
        // particleSystemRef.current.setForceScale(forceScale);
        // particleSystemRef.current.setMaxSpeed(maxSpeed);
        // particleSystemRef.current.setDamping(damping);
      }

      // Initialize input handler
      inputHandlerRef.current = new InputHandler(cameraRef.current, canvas);

      console.log("All systems initialized successfully");
      console.log("Canvas parameters:", {
        particleCount,
        colorCount,
        sensingRadius,
        forceScale,
        maxSpeed,
        damping,
      });

      // Force an initial render
      if (
        particleSystemRef.current &&
        rendererRef.current &&
        cameraRef.current
      ) {
        const transform = cameraRef.current.getTransformUniforms();
        rendererRef.current.render(
          particleSystemRef.current.positions,
          particleSystemRef.current.colors,
          particleSystemRef.current.sizes,
          particleCount,
          transform.cameraPosition,
          transform.cameraZoom,
        );
      }
    } catch (error) {
      console.error("Failed to initialize systems:", error);
      return;
    }

    // Animation loop
    const animate = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        0.1,
      ); // Cap at 100ms
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
  }, [
    particleCount,
    colorCount,
    sensingRadius,
    forceScale,
    maxSpeed,
    damping,
    colorMatrix,
    handleResize,
    updateFps,
  ]); // Re-run when any of these props change

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!cameraRef.current) return;

      switch (event.key) {
        case "r":
        case "R":
          // Reset camera
          cameraRef.current.reset();
          break;
        case "=":
        case "+":
          // Zoom in
          cameraRef.current.setZoom(cameraRef.current.zoom * 1.2);
          break;
        case "-":
        case "_":
          // Zoom out
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
