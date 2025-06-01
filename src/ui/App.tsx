import { Canvas } from "./components/Canvas";
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

function App() {
  const particleCount = 3000;
  const colorCount = 6;

  return (
    <div style={containerStyle}>
      <Canvas particleCount={particleCount} colorCount={colorCount} />
      <div style={headerStyle}>
        <h2 style={titleStyle}>Particle Life</h2>
        <p style={infoStyle}>
          {particleCount} particles • {colorCount} colors
        </p>
      </div>
    </div>
  );
}

export default App;
