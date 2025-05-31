import React, { useRef, useEffect, useCallback } from "react";
import { WebGLRenderer } from "../simulation/WebGLRenderer";
import { ParticleSystem } from "../simulation/ParticleSystem";

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
  const animationIdRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Update renderer and particle system
    if (rendererRef.current) {
      rendererRef.current.resize(canvas.width, canvas.height);
    }
    if (particleSystemRef.current) {
      particleSystemRef.current.resize(canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial size
    handleResize();

    // Initialize WebGL renderer
    try {
      rendererRef.current = new WebGLRenderer(canvas);
    } catch (error) {
      console.error("Failed to initialize WebGL:", error);
      return;
    }

    // Initialize particle system
    particleSystemRef.current = new ParticleSystem({
      particleCount,
      bounds: { width: canvas.width, height: canvas.height },
      colorCount,
    });

    // Animation loop
    const animate = (currentTime: number) => {
      const deltaTime = Math.min(
        (currentTime - lastTimeRef.current) / 1000,
        0.1,
      ); // Cap at 100ms
      lastTimeRef.current = currentTime;

      if (particleSystemRef.current && rendererRef.current) {
        // Update particle physics
        particleSystemRef.current.update(deltaTime);

        // Render particles
        rendererRef.current.render(
          particleSystemRef.current.positions,
          particleSystemRef.current.colors,
          particleSystemRef.current.sizes,
          particleCount,
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

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [particleCount, colorCount, handleResize]);

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
        cursor: "none",
      }}
    />
  );
};
