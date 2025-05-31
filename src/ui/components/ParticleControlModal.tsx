import React, { useState, useCallback } from "react";
import {
  ToggleButton,
  MinimizedStatus,
  ModalHeader,
  SimulationParameters,
  InteractionMatrix,
  AdvancedSettings,
  Color,
} from "./ControlComponents";

// Particle colors
const colors: Color[] = [
  { name: "Red", hex: "#ff4444" },
  { name: "Orange", hex: "#ff8844" },
  { name: "Yellow", hex: "#ffdd44" },
  { name: "Green", hex: "#44ff44" },
  { name: "Blue", hex: "#4488ff" },
  { name: "Purple", hex: "#8844ff" },
];

interface ParticleControlModalProps {
  particleCount: number;
  setParticleCount: (count: number) => void;
  colorCount: number;
  setColorCount: (count: number) => void;
  sensingRadius: number;
  setSensingRadius: (radius: number) => void;
  forceScale: number;
  setForceScale: (scale: number) => void;
  maxSpeed: number;
  setMaxSpeed: (speed: number) => void;
  damping: number;
  setDamping: (damping: number) => void;
  matrix: number[][];
  setMatrix: (matrix: number[][]) => void;
  onRefresh: () => void;
  fps: number;
}

const ParticleControlModal: React.FC<ParticleControlModalProps> = ({
  particleCount,
  setParticleCount,
  colorCount,
  setColorCount,
  sensingRadius,
  setSensingRadius,
  forceScale,
  setForceScale,
  maxSpeed,
  setMaxSpeed,
  damping,
  setDamping,
  matrix,
  setMatrix,
  onRefresh,
  fps,
}) => {
  // Only visibility state stays internal
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Matrix cell click handler
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const currentValue = matrix[row][col];
      const newValue = prompt(
        `${colors[row].name} → ${colors[col].name}\nCurrent: ${currentValue.toFixed(1)}\nEnter new value (-1 to 1):`,
        currentValue.toString(),
      );

      if (newValue !== null) {
        const parsed = parseFloat(newValue);
        if (!isNaN(parsed)) {
          const clampedValue = Math.max(-1, Math.min(1, parsed));
          const newMatrix = [...matrix];
          newMatrix[row][col] = clampedValue;
          setMatrix(newMatrix);
        }
      }
    },
    [matrix],
  );

  // Matrix manipulation functions
  const randomizeMatrix = useCallback(() => {
    const newMatrix = matrix.map((row, i) =>
      row.map(
        (_, j) => (i === j ? -0.4 : (Math.random() - 0.5) * 2), // -1 to 1 range
      ),
    );
    setMatrix(newMatrix);
  }, [matrix, setMatrix]);

  const clearMatrix = useCallback(() => {
    const newMatrix = matrix.map((row, i) =>
      row.map((_, j) => (i === j ? -0.4 : 0)),
    );
    setMatrix(newMatrix);
  }, [matrix, setMatrix]);

  const makeSymmetric = useCallback(() => {
    const newMatrix = matrix.map((row, i) =>
      row.map((_, j) => {
        if (i === j) return matrix[i][j];
        const avgValue = (matrix[i][j] + matrix[j][i]) / 2;
        return avgValue;
      }),
    );
    setMatrix(newMatrix);
  }, [matrix, setMatrix]);

  // Refresh simulation handler - now just calls the prop
  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  // Render different states
  if (!isVisible) {
    return <ToggleButton onClick={() => setIsVisible(true)} />;
  }

  if (isMinimized) {
    return (
      <MinimizedStatus
        sensingRadius={sensingRadius}
        forceScale={forceScale}
        maxSpeed={maxSpeed}
        fps={fps}
        onExpand={() => setIsMinimized(false)}
        onClose={() => setIsVisible(false)}
      />
    );
  }

  // Full modal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-black bg-opacity-90 text-white p-6 rounded-lg border border-white border-opacity-30 max-w-md w-full max-h-[90vh] overflow-y-auto font-mono">
        <ModalHeader
          onMinimize={() => setIsMinimized(true)}
          onClose={() => setIsVisible(false)}
        />

        <SimulationParameters
          particleCount={particleCount}
          setParticleCount={setParticleCount}
          colorCount={colorCount}
          setColorCount={setColorCount}
          onRefresh={handleRefresh}
        />

        <InteractionMatrix
          matrix={matrix}
          colorCount={colorCount}
          colors={colors}
          onCellClick={handleCellClick}
          onRandomize={randomizeMatrix}
          onClear={clearMatrix}
          onSymmetric={makeSymmetric}
        />

        <AdvancedSettings
          sensingRadius={sensingRadius}
          setSensingRadius={setSensingRadius}
          forceScale={forceScale}
          setForceScale={setForceScale}
          maxSpeed={maxSpeed}
          setMaxSpeed={setMaxSpeed}
          damping={damping}
          setDamping={setDamping}
          fps={fps}
        />
      </div>
    </div>
  );
};

export default ParticleControlModal;
