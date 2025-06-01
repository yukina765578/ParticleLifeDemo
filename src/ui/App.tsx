import { useState, useCallback } from "react";
import { Canvas } from "./components/Canvas";
import { ControlPanel } from "./components/controlPanel/ControlPanel";
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

  // Initialize color matrix
  const initializeMatrix = (count: number) => {
    const matrix: number[][] = [];
    for (let i = 0; i < count; i++) {
      matrix[i] = [];
      for (let j = 0; j < count; j++) {
        if (i === j) {
          matrix[i][j] = -0.4; // Same color repulsion
        } else {
          matrix[i][j] = (Math.random() - 0.5) * 3.0; // Random attraction/repulsion
        }
      }
    }
    return matrix;
  };

  const [colorMatrix, setColorMatrix] = useState<number[][]>(() =>
    initializeMatrix(colorCount),
  );

  // FPS state for display
  const [fps, setFps] = useState(0);

  // Handler for particle count change
  const handleParticleCountChange = useCallback((count: number) => {
    setParticleCount(count);
  }, []);

  // Handler for color count change
  const handleColorCountChange = useCallback((count: number) => {
    setColorCount(count);
    // Reset matrix for new color count
    setColorMatrix(initializeMatrix(count));
  }, []);

  // Handler for matrix update
  const handleMatrixUpdate = useCallback((newMatrix: number[][]) => {
    setColorMatrix(newMatrix);
  }, []);

  // Handler for sensing radius change
  const handleSensingRadiusChange = useCallback((radius: number) => {
    setSensingRadius(radius);
  }, []);

  // Handler for force scale change
  const handleForceScaleChange = useCallback((scale: number) => {
    setForceScale(scale);
  }, []);

  // Handler for max speed change
  const handleMaxSpeedChange = useCallback((speed: number) => {
    setMaxSpeed(speed);
  }, []);

  // Handler for damping change
  const handleDampingChange = useCallback((dampingValue: number) => {
    setDamping(dampingValue);
  }, []);

  // Handler for FPS updates from Canvas
  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  return (
    <div style={containerStyle}>
      <Canvas
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
        onMatrixUpdate={handleMatrixUpdate}
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
