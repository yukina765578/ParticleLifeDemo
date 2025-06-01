import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
    rect: DOMRect;
  } | null>(null);

  const matrixRef = useRef<HTMLDivElement>(null);

  // Initialize pending matrix when colorMatrix changes
  useEffect(() => {
    setPendingMatrix(colorMatrix.map((row) => [...row]));
    setHasChanges(false);
  }, [colorMatrix]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeCell && !event.target) return;

      const target = event.target as Element;
      const isSliderClick = target.closest("[data-slider-popup]");
      const isCellClick = target.closest("[data-matrix-cell]");

      if (!isSliderClick && !isCellClick) {
        setActiveCell(null);
      }
    };

    if (activeCell) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [activeCell]);

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
    (row: number, col: number, event: React.MouseEvent) => {
      const cellElement = event.currentTarget as HTMLElement;
      const rect = cellElement.getBoundingClientRect();

      if (activeCell?.row === row && activeCell?.col === col) {
        setActiveCell(null);
      } else {
        setActiveCell({ row, col, rect });
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
          newMatrix[i][j] = (Math.random() - 0.5) * 2.0;
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

  const calculateSliderPosition = (rect: DOMRect) => {
    const sliderWidth = 240;
    const sliderHeight = 80;
    const margin = 10;

    // Start with position above the cell
    let top = rect.top - sliderHeight - margin;
    let left = rect.left + rect.width / 2 - sliderWidth / 2;

    // Adjust if going off-screen
    if (top < margin) {
      // Position below if not enough space above
      top = rect.bottom + margin;
    }

    if (left < margin) {
      left = margin;
    } else if (left + sliderWidth > window.innerWidth - margin) {
      left = window.innerWidth - sliderWidth - margin;
    }

    // Ensure it doesn't go off the bottom
    if (top + sliderHeight > window.innerHeight - margin) {
      top = window.innerHeight - sliderHeight - margin;
    }

    return { top, left };
  };

  const renderSliderPopup = () => {
    if (!activeCell) return null;

    const value = pendingMatrix[activeCell.row]?.[activeCell.col] || 0;
    const position = calculateSliderPosition(activeCell.rect);

    // Calculate arrow position
    const arrowLeft =
      activeCell.rect.left + activeCell.rect.width / 2 - position.left;
    const isAbove = position.top < activeCell.rect.top;

    const sliderContainerStyle: React.CSSProperties = {
      position: "fixed",
      top: position.top,
      left: position.left,
      background: "rgba(20, 20, 30, 0.98)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "8px",
      padding: "12px",
      width: "220px",
      zIndex: 10000,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(8px)",
      color: "white",
      fontFamily: "monospace",
    };

    const arrowStyle: React.CSSProperties = {
      position: "absolute",
      left: Math.max(8, Math.min(arrowLeft, 220 - 16)),
      width: 0,
      height: 0,
      borderLeft: "8px solid transparent",
      borderRight: "8px solid transparent",
      ...(isAbove
        ? {
            bottom: "-8px",
            borderTop: "8px solid rgba(20, 20, 30, 0.98)",
          }
        : {
            top: "-8px",
            borderBottom: "8px solid rgba(20, 20, 30, 0.98)",
          }),
    };

    const sliderStyle: React.CSSProperties = {
      width: "100%",
      height: "6px",
      background:
        "linear-gradient(to right, #ff4444 0%, #ffffff 50%, #44ff44 100%)",
      borderRadius: "3px",
      outline: "none",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
    };

    return createPortal(
      <div style={sliderContainerStyle} data-slider-popup>
        <div style={arrowStyle}></div>

        <div
          style={{
            marginBottom: "12px",
            fontSize: "12px",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Color {activeCell.row} → Color {activeCell.col}
        </div>

        <div
          style={{
            marginBottom: "8px",
            fontSize: "11px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          Interaction Strength: {value.toFixed(2)}
        </div>

        <input
          type="range"
          min="-1"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) =>
            handleValueChange(
              activeCell.row,
              activeCell.col,
              parseFloat(e.target.value),
            )
          }
          style={sliderStyle}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
            marginTop: "6px",
            opacity: 0.7,
          }}
        >
          <span>Repel (-1)</span>
          <span>Neutral (0)</span>
          <span>Attract (+1)</span>
        </div>

        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            textAlign: "center",
            opacity: 0.6,
          }}
        >
          Click outside to close
        </div>
      </div>,
      document.body,
    );
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
    transform: isActive ? "scale(1.05)" : "scale(1)",
  });

  const colorLabelStyle = (color: string): React.CSSProperties => ({
    width: "16px",
    height: "16px",
    background: color,
    borderRadius: "2px",
    margin: "auto",
  });

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
        Interaction Matrix (-1 to +1) • Click cells to edit
      </div>

      <div ref={matrixRef} style={gridStyle}>
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
                  onClick={(e) => handleCellClick(i, j, e)}
                  data-matrix-cell
                >
                  {value.toFixed(1)}
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

      {renderSliderPopup()}
    </div>
  );
};
