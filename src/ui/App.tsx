import { useState, useRef, useCallback, useEffect } from "react";
import { Canvas } from "./components/Canvas";
import { ControlPanel } from "./components/controlPanel/ControlPanel";
import { ParticleSystem } from "./simulation/ParticleSystem";
import "./App.css";

const containerStyle: React.CSSProperties = {
  position: "relative",
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
};

const headerStyle: React.CSSProperties = {
  position: "absolute",
  top: "20px",
  left: "20px",
  color: "white",
  fontFamily: "monospace",
  fontSize: "14px",
  textShadow: "0 0 10px rgba(0,0,0,0.8)",
  zIndex: 10,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
};

const infoStyle: React.CSSProperties = {
  margin: "5px 0",
  opacity: 0.8,
};

function App() {
  // State for particle system parameters
  const [particleCount, setParticleCount] = useState(3000);
  const [colorCount, setColorCount] = useState(6);
  const [sensingRadius, setSensingRadius] = useState(80);
  const [forceScale, setForceScale] = useState(150);
  const [maxSpeed, setMaxSpeed] = useState(120);
  const [damping, setDamping] = useState(0.98);
  const [colorMatrix, setColorMatrix] = useState<number[][]>(() => {
    // Initialize with default values
    const matrix: number[][] = [];
    for (let i = 0; i < colorCount; i++) {
      matrix[i] = [];
      for (let j = 0; j < colorCount; j++) {
        if (i === j) {
          matrix[i][j] = -0.4; // Same color repulsion
        } else {
          matrix[i][j] = (Math.random() - 0.5) * 3.0; // Random attraction/repulsion
        }
      }
    }
    return matrix;
  });

  // Ref to hold the particle system instance
  const particleSystemRef = useRef<ParticleSystem | null>(null);

  // FPS state for display
  const [fps, setFps] = useState(0);

  // Create or recreate particle system when count or color changes
  const createParticleSystem = useCallback(() => {
    // Default world size (will be updated by Canvas based on actual size)
    const worldSize = 4000;

    const newSystem = new ParticleSystem({
      particleCount,
      worldSize: { width: worldSize, height: worldSize },
      colorCount,
      sensingRadius,
      betaDistance: 15,
    });

    // Apply the color matrix
    for (let i = 0; i < colorCount; i++) {
      for (let j = 0; j < colorCount; j++) {
        if (colorMatrix[i] && colorMatrix[i][j] !== undefined) {
          newSystem.setColorRule(i, j, colorMatrix[i][j]);
        }
      }
    }

    particleSystemRef.current = newSystem;
    return newSystem;
  }, [particleCount, colorCount, sensingRadius, colorMatrix]);

  // Initialize particle system on mount
  useEffect(() => {
    createParticleSystem();
  }, []); // Only on mount

  // Handler for particle count change
  const handleParticleCountChange = useCallback(
    (count: number) => {
      setParticleCount(count);
      // Recreate the particle system with new count
      createParticleSystem();
    },
    [createParticleSystem],
  );

  // Handler for color count change
  const handleColorCountChange = useCallback(
    (count: number) => {
      setColorCount(count);

      // Update color matrix for new color count
      const newMatrix: number[][] = [];
      for (let i = 0; i < count; i++) {
        newMatrix[i] = [];
        for (let j = 0; j < count; j++) {
          if (i === j) {
            newMatrix[i][j] = -0.4;
          } else {
            newMatrix[i][j] = (Math.random() - 0.5) * 3.0;
          }
        }
      }
      setColorMatrix(newMatrix);

      // Recreate the particle system
      createParticleSystem();
    },
    [createParticleSystem],
  );

  // Handler for sensing radius change
  const handleSensingRadiusChange = useCallback((radius: number) => {
    setSensingRadius(radius);
    if (particleSystemRef.current) {
      particleSystemRef.current.setSensingRadius(radius);
    }
  }, []);

  // Handler for force scale change
  const handleForceScaleChange = useCallback((scale: number) => {
    setForceScale(scale);
    // Note: You'll need to add setForceScale method to ParticleSystem
  }, []);

  // Handler for max speed change
  const handleMaxSpeedChange = useCallback((speed: number) => {
    setMaxSpeed(speed);
    // Note: You'll need to add setMaxSpeed method to ParticleSystem
  }, []);

  // Handler for damping change
  const handleDampingChange = useCallback((dampingValue: number) => {
    setDamping(dampingValue);
    // Note: You'll need to add setDamping method to ParticleSystem
  }, []);

  // Handler for FPS updates from Canvas
  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  return (
    <div style={containerStyle}>
      <Canvas
        particleSystem={particleSystemRef.current}
        particleCount={particleCount}
        colorCount={colorCount}
        sensingRadius={sensingRadius}
        forceScale={forceScale}
        maxSpeed={maxSpeed}
        damping={damping}
        colorMatrix={colorMatrix}
        onFpsUpdate={handleFpsUpdate}
      />
      <ControlPanel
        particleSystem={particleSystemRef.current}
        particleCount={particleCount}
        colorCount={colorCount}
        sensingRadius={sensingRadius}
        forceScale={forceScale}
        maxSpeed={maxSpeed}
        damping={damping}
        colorMatrix={colorMatrix}
        onParticleCountChange={handleParticleCountChange}
        onColorCountChange={handleColorCountChange}
        onSensingRadiusChange={handleSensingRadiusChange}
        onForceScaleChange={handleForceScaleChange}
        onMaxSpeedChange={handleMaxSpeedChange}
        onDampingChange={handleDampingChange}
      />
      <div style={headerStyle}>
        <h2 style={titleStyle}>Particle Life</h2>
        <p style={infoStyle}>
          {particleCount} particles • {colorCount} colors • {fps} FPS
        </p>
      </div>
    </div>
  );
}

export default App;
