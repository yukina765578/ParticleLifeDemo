import React, { useState, useCallback, useEffect } from "react";

interface InteractionMatrixProps {
  colorCount: number;
  colorMatrix: number[][];
  onMatrixUpdate: (matrix: number[][]) => void;
}

export const InteractionMatrix: React.FC<InteractionMatrixProps> = ({
  colorCount,
  colorMatrix,
  onMatrixUpdate,
}) => {
  // Local state for pending changes
  const [pendingMatrix, setPendingMatrix] = useState<number[][]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeCell, setActiveCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  // Initialize pending matrix when colorMatrix changes
  useEffect(() => {
    setPendingMatrix(colorMatrix.map((row) => [...row]));
    setHasChanges(false);
  }, [colorMatrix]);

  const getColorForIndex = (index: number): string => {
    const hue = (index / colorCount) * 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  const handleValueChange = useCallback(
    (colorA: number, colorB: number, value: number) => {
      const clampedValue = Math.max(-1, Math.min(1, value));

      setPendingMatrix((prev) => {
        const newMatrix = prev.map((row) => [...row]);
        newMatrix[colorA][colorB] = clampedValue;
        return newMatrix;
      });

      setHasChanges(true);
    },
    [],
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (activeCell?.row === row && activeCell?.col === col) {
        setActiveCell(null);
      } else {
        setActiveCell({ row, col });
      }
    },
    [activeCell],
  );

  const handleApplyChanges = useCallback(() => {
    onMatrixUpdate(pendingMatrix);
    setHasChanges(false);
  }, [pendingMatrix, onMatrixUpdate]);

  const handleRandomize = useCallback(() => {
    const newMatrix: number[][] = [];
    for (let i = 0; i < colorCount; i++) {
      newMatrix[i] = [];
      for (let j = 0; j < colorCount; j++) {
        if (i === j) {
          newMatrix[i][j] = -0.4;
        } else {
          newMatrix[i][j] = (Math.random() - 0.5) * 3.0;
        }
      }
    }
    setPendingMatrix(newMatrix);
    setHasChanges(true);
  }, [colorCount]);

  const getValueColor = (value: number): string => {
    if (value > 0) {
      // Positive values: green gradient
      const intensity = Math.abs(value);
      return `rgba(100, 255, 100, ${0.2 + intensity * 0.3})`;
    } else if (value < 0) {
      // Negative values: red gradient
      const intensity = Math.abs(value);
      return `rgba(255, 100, 100, ${0.2 + intensity * 0.3})`;
    } else {
      // Zero: neutral
      return "rgba(255, 255, 255, 0.1)";
    }
  };

  const getSliderPosition = (row: number, col: number) => {
    // Calculate position to keep slider visible
    const isTopHalf = row < colorCount / 2;
    const isLeftHalf = col < colorCount / 2;

    return {
      bottom: isTopHalf ? "auto" : "100%",
      top: isTopHalf ? "100%" : "auto",
      left: isLeftHalf ? "0" : "auto",
      right: isLeftHalf ? "auto" : "0",
      transform: "none",
    };
  };

  const containerStyle: React.CSSProperties = {
    marginTop: "16px",
    position: "relative",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `20px repeat(${colorCount}, 40px)`,
    gridTemplateRows: `20px repeat(${colorCount}, 40px)`,
    gap: "1px",
    marginBottom: "12px",
  };

  const cellStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
  };

  const valueCellStyle = (
    value: number,
    isActive: boolean,
  ): React.CSSProperties => ({
    ...cellStyle,
    background: getValueColor(value),
    cursor: "pointer",
    position: "relative",
    transition: "all 0.2s",
    fontSize: "11px",
    fontWeight: isActive ? "bold" : "normal",
    outline: isActive ? "2px solid rgba(255, 255, 255, 0.5)" : "none",
  });

  const colorLabelStyle = (color: string): React.CSSProperties => ({
    width: "16px",
    height: "16px",
    background: color,
    borderRadius: "2px",
    margin: "auto",
  });

  const sliderContainerStyle = (
    row: number,
    col: number,
  ): React.CSSProperties => ({
    position: "absolute",
    ...getSliderPosition(row, col),
    background: "rgba(20, 20, 30, 0.95)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "4px",
    padding: "8px",
    width: "200px",
    zIndex: 1000,
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
  });

  const sliderStyle: React.CSSProperties = {
    width: "100%",
    height: "4px",
    background:
      "linear-gradient(to right, #ff4444 0%, #ffffff 50%, #44ff44 100%)",
    borderRadius: "2px",
    outline: "none",
    cursor: "pointer",
  };

  const buttonStyle: React.CSSProperties = {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "4px",
    color: "white",
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: "11px",
    transition: "all 0.2s",
    marginBottom: "6px",
    width: "100%",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    flexDirection: "column",
  };

  const applyButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: hasChanges
      ? "rgba(100, 200, 100, 0.3)"
      : "rgba(255, 255, 255, 0.1)",
    borderColor: hasChanges
      ? "rgba(100, 200, 100, 0.5)"
      : "rgba(255, 255, 255, 0.2)",
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: "8px", fontSize: "11px", opacity: 0.8 }}>
        Interaction Matrix (-1 to +1)
      </div>

      <div style={gridStyle}>
        {/* Empty top-left cell */}
        <div style={cellStyle}></div>

        {/* Column headers */}
        {Array.from({ length: colorCount }).map((_, i) => (
          <div key={`col-${i}`} style={cellStyle}>
            <div style={colorLabelStyle(getColorForIndex(i))}></div>
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: colorCount }).map((_, i) => (
          <React.Fragment key={`row-${i}`}>
            {/* Row header */}
            <div style={cellStyle}>
              <div style={colorLabelStyle(getColorForIndex(i))}></div>
            </div>

            {/* Matrix cells */}
            {Array.from({ length: colorCount }).map((_, j) => {
              const value = pendingMatrix[i]?.[j] || 0;
              const isActive = activeCell?.row === i && activeCell?.col === j;

              return (
                <div
                  key={`cell-${i}-${j}`}
                  style={valueCellStyle(value, isActive)}
                  onClick={() => handleCellClick(i, j)}
                >
                  {value.toFixed(1)}

                  {isActive && (
                    <div style={sliderContainerStyle(i, j)}>
                      <div
                        style={{
                          marginBottom: "8px",
                          fontSize: "11px",
                          textAlign: "center",
                        }}
                      >
                        Adjust Interaction: {value.toFixed(2)}
                      </div>
                      <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.05"
                        value={value}
                        onChange={(e) =>
                          handleValueChange(i, j, parseFloat(e.target.value))
                        }
                        style={sliderStyle}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "10px",
                          marginTop: "4px",
                          opacity: 0.7,
                        }}
                      >
                        <span>Repel</span>
                        <span>Attract</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div style={buttonContainerStyle}>
        <button
          style={applyButtonStyle}
          onClick={handleApplyChanges}
          disabled={!hasChanges}
          onMouseEnter={(e) => {
            if (hasChanges) {
              e.currentTarget.style.background = "rgba(100, 200, 100, 0.4)";
              e.currentTarget.style.borderColor = "rgba(100, 200, 100, 0.6)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hasChanges
              ? "rgba(100, 200, 100, 0.3)"
              : "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = hasChanges
              ? "rgba(100, 200, 100, 0.5)"
              : "rgba(255, 255, 255, 0.2)";
          }}
        >
          Apply Changes {hasChanges ? "•" : ""}
        </button>

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
    </div>
  );
};
