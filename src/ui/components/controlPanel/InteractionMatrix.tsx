import React, { useState, useCallback } from "react";
import { ParticleSystem } from "../simulation/ParticleSystem";

interface InteractionMatrixProps {
  particleSystem: ParticleSystem | null;
  colorCount: number;
}

export const InteractionMatrix: React.FC<InteractionMatrixProps> = ({
  particleSystem,
  colorCount,
}) => {
  const [matrix, setMatrix] = useState<number[][]>(() => {
    const initial: number[][] = [];
    for (let i = 0; i < colorCount; i++) {
      initial[i] = [];
      for (let j = 0; j < colorCount; j++) {
        initial[i][j] = particleSystem?.getColorRule(i, j) || 0;
      }
    }
    return initial;
  });

  const getColorForIndex = (index: number): string => {
    const hue = (index / colorCount) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleValueChange = useCallback(
    (colorA: number, colorB: number, value: number) => {
      if (!particleSystem) return;

      const clampedValue = Math.max(-1, Math.min(1, value));
      particleSystem.setColorRule(colorA, colorB, clampedValue);

      setMatrix((prev) => {
        const newMatrix = [...prev];
        newMatrix[colorA] = [...newMatrix[colorA]];
        newMatrix[colorA][colorB] = clampedValue;
        return newMatrix;
      });
    },
    [particleSystem],
  );

  const handleRandomize = useCallback(() => {
    if (!particleSystem) return;

    particleSystem.randomizeRules();

    // Update local state to reflect new rules
    const newMatrix: number[][] = [];
    for (let i = 0; i < colorCount; i++) {
      newMatrix[i] = [];
      for (let j = 0; j < colorCount; j++) {
        newMatrix[i][j] = particleSystem.getColorRule(i, j);
      }
    }
    setMatrix(newMatrix);
  }, [particleSystem, colorCount]);

  const containerStyle: React.CSSProperties = {
    marginTop: "16px",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `24px repeat(${colorCount}, 1fr)`,
    gridTemplateRows: `24px repeat(${colorCount}, 1fr)`,
    gap: "4px",
    marginBottom: "12px",
  };

  const cellStyle: React.CSSProperties = {
    width: "100%",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    color: "white",
    textAlign: "center",
    fontSize: "12px",
    padding: "0",
    transition: "all 0.2s",
  };

  const colorLabelStyle = (color: string): React.CSSProperties => ({
    ...cellStyle,
    background: color,
    borderRadius: "4px",
  });

  const buttonStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    color: "white",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "12px",
    transition: "all 0.2s",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "8px", fontSize: "13px", opacity: 0.8 }}>
        Interaction Matrix (-1 to +1)
      </div>

      <div style={gridStyle}>
        {/* Empty top-left cell */}
        <div style={cellStyle}></div>

        {/* Column headers */}
        {Array.from({ length: colorCount }).map((_, i) => (
          <div
            key={`col-${i}`}
            style={colorLabelStyle(getColorForIndex(i))}
          ></div>
        ))}

        {/* Rows */}
        {Array.from({ length: colorCount }).map((_, i) => (
          <React.Fragment key={`row-${i}`}>
            {/* Row header */}
            <div style={colorLabelStyle(getColorForIndex(i))}></div>

            {/* Matrix cells */}
            {Array.from({ length: colorCount }).map((_, j) => (
              <input
                key={`cell-${i}-${j}`}
                type="number"
                value={matrix[i][j].toFixed(2)}
                onChange={(e) =>
                  handleValueChange(i, j, parseFloat(e.target.value) || 0)
                }
                style={inputStyle}
                step="0.1"
                min="-1"
                max="1"
                onFocus={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.4)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.2)";
                }}
              />
            ))}
          </React.Fragment>
        ))}
      </div>

      <button
        style={buttonStyle}
        onClick={handleRandomize}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
        }}
      >
        Randomize Rules
      </button>
    </div>
  );
};
