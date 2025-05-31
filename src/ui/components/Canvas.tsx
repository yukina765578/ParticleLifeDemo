import React, { useRef, useEffect, useCallback } from "react";
import { WebGLRenderer } from "../simulation/WebGLRenderer";
import { ParticleSystem } from "../simulation/ParticleSystem";
import { Camera } from "../simulation/Camera";
import { InputHandler } from "../simulation/InputHandler";

interface ParticleCanvasProps {
  particleCount?: number;
  colorCount?: number;
}

export const Canvas: React.FC<ParticleCanvasProps> = ({
  particleCount = 2000,
  colorCount = 6,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const inputHandlerRef = useRef<InputHandler | null>(null);
  const animationIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

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

      // Initialize particle system with large world
      const worldSize = Math.max(canvas.width, canvas.height) * 4; // 4x screen size
      particleSystemRef.current = new ParticleSystem({
        particleCount,
        worldSize: { width: worldSize, height: worldSize },
        colorCount,
      });

      // Initialize input handler
      inputHandlerRef.current = new InputHandler(cameraRef.current, canvas);

      // Force initial render setup
      const initialTransform = cameraRef.current.getTransformUniforms();

      console.log("All systems initialized successfully");
      console.log("Initial canvas size:", canvas.width, "x", canvas.height);
      console.log("Initial camera:", initialTransform);

      // Force an initial render to make sure everything shows up
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
  }, [particleCount, colorCount, handleResize]);

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
