import React, { useState, useCallback } from "react";
import { Canvas } from "./components/Canvas";
import ParticleControlModal from "./components/ParticleControlModal";
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
};

const titleStyle: React.CSSProperties = {
  margin: 0,
};

const infoStyle: React.CSSProperties = {
  margin: "5px 0",
  opacity: 0.8,
};

// Initial interaction matrix
const initialMatrix = [
  [-0.4, 0.8, -0.2, 0.3, -0.7, 0.1],
  [0.5, -0.4, 0.9, -0.6, 0.3, -0.2],
  [-0.9, 0.7, -0.4, 0.0, -0.5, 0.8],
  [0.6, -0.1, 0.4, -0.4, 0.9, -0.8],
  [-0.3, 0.2, -0.7, 0.2, -0.4, 0.6],
  [0.0, -0.5, 0.1, -0.9, 0.7, -0.4],
];

function App() {
  // Simulation parameters state
  const [particleCount, setParticleCount] = useState(3000);
  const [colorCount, setColorCount] = useState(6);
  const [sensingRadius, setSensingRadius] = useState(80);
  const [forceScale, setForceScale] = useState(150);
  const [maxSpeed, setMaxSpeed] = useState(120);
  const [damping, setDamping] = useState(0.98);
  const [matrix, setMatrix] = useState(initialMatrix);

  // Key to force Canvas/ParticleSystem refresh
  const [refreshKey, setRefreshKey] = useState(0);

  // FPS tracking (you can connect this to actual FPS from Canvas)
  const [fps, setFps] = useState(60);

  const handleRefresh = useCallback(() => {
    console.log("Refreshing simulation with new parameters:", {
      particleCount,
      colorCount,
      sensingRadius,
      forceScale,
      maxSpeed,
      damping,
      matrix,
    });
    setRefreshKey((prev) => prev + 1);
  }, [
    particleCount,
    colorCount,
    sensingRadius,
    forceScale,
    maxSpeed,
    damping,
    matrix,
  ]);

  return (
    <div style={containerStyle}>
      <Canvas
        key={refreshKey} // This forces re-mount when refreshKey changes
        particleCount={particleCount}
        colorCount={colorCount}
        sensingRadius={sensingRadius}
        forceScale={forceScale}
        maxSpeed={maxSpeed}
        damping={damping}
        colorMatrix={matrix}
        onFpsUpdate={setFps} // Optional: to get real FPS from Canvas
      />
      <div style={headerStyle}>
        <h2 style={titleStyle}>Particle Life</h2>
        <p style={infoStyle}>
          {particleCount} particles • {colorCount} colors
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          top: "80px",
          left: "20px",
          color: "red",
          fontSize: "16px",
          zIndex: 1000,
        }}
      >
        TEST - Controls should be here
        <ParticleControlModal
          particleCount={particleCount}
          setParticleCount={setParticleCount}
          colorCount={colorCount}
          setColorCount={setColorCount}
          sensingRadius={sensingRadius}
          setSensingRadius={setSensingRadius}
          forceScale={forceScale}
          setForceScale={setForceScale}
          maxSpeed={maxSpeed}
          setMaxSpeed={setMaxSpeed}
          damping={damping}
          setDamping={setDamping}
          matrix={matrix}
          setMatrix={setMatrix}
          onRefresh={handleRefresh}
          fps={fps}
        />
      </div>
    </div>
  );
}

export default App;
