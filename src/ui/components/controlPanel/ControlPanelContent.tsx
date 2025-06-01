import React from "react";
import { InteractionMatrix } from "./InteractionMatrix";

interface ControlPanelContentProps {
  particleCount: number;
  colorCount: number;
  colorMatrix: number[][];
  onParticleCountChange: (count: number) => void;
  onColorCountChange: (count: number) => void;
  onMatrixUpdate: (matrix: number[][]) => void;
}

export const ControlPanelContent: React.FC<ControlPanelContentProps> = ({
  particleCount,
  colorCount,
  colorMatrix,
  onParticleCountChange,
  onColorCountChange,
  onMatrixUpdate,
}) => {
  const contentStyle: React.CSSProperties = {
    padding: "16px",
    maxHeight: "60vh",
    overflowY: "auto",
  };

  const controlGroupStyle: React.CSSProperties = {
    marginBottom: "16px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    marginBottom: "6px",
    opacity: 0.8,
  };

  const sliderContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const sliderStyle: React.CSSProperties = {
    flex: 1,
    height: "4px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "2px",
    outline: "none",
    cursor: "pointer",
  };

  const valueDisplayStyle: React.CSSProperties = {
    fontSize: "13px",
    minWidth: "50px",
    textAlign: "right",
  };

  return (
    <div style={contentStyle}>
      <div style={controlGroupStyle}>
        <label style={labelStyle}>Particle Count</label>
        <div style={sliderContainerStyle}>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={particleCount}
            onChange={(e) => onParticleCountChange(parseInt(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueDisplayStyle}>{particleCount}</span>
        </div>
      </div>

      <div style={controlGroupStyle}>
        <label style={labelStyle}>Color Count</label>
        <div style={sliderContainerStyle}>
          <input
            type="range"
            min="2"
            max="6"
            step="1"
            value={colorCount}
            onChange={(e) => onColorCountChange(parseInt(e.target.value))}
            style={sliderStyle}
          />
          <span style={valueDisplayStyle}>{colorCount}</span>
        </div>
      </div>

      <InteractionMatrix
        colorCount={colorCount}
        colorMatrix={colorMatrix}
        onMatrixUpdate={onMatrixUpdate}
      />
    </div>
  );
};
