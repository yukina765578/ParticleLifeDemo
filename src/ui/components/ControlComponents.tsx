import React from "react";

// Types
export interface Color {
  name: string;
  hex: string;
}

export interface ControlComponentsProps {
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
  matrix: number[][];
  fps: number;
  onRefresh: () => void;
  onCellClick: (row: number, col: number) => void;
  onRandomize: () => void;
  onClear: () => void;
  onSymmetric: () => void;
}

// Utility functions
export const getColorForValue = (value: number): string => {
  const clampedValue = Math.max(-1, Math.min(1, value));

  if (clampedValue < 0) {
    const intensity = Math.abs(clampedValue);
    const red = Math.floor(255 * intensity);
    const green = Math.floor(255 * (1 - intensity));
    return `rgb(${red}, ${green}, ${green})`;
  } else {
    const intensity = clampedValue;
    const red = Math.floor(255 * (1 - intensity));
    const green = Math.floor(255 * intensity);
    return `rgb(${red}, ${green}, ${red})`;
  }
};

export const getTextColor = (value: number): string =>
  Math.abs(value) > 0.5 ? "white" : "black";

// Toggle Button Component
export const ToggleButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <button
    onClick={onClick}
    className="fixed top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded border border-white border-opacity-30 hover:bg-opacity-70 transition-all duration-200 font-mono text-sm"
  >
    Controls
  </button>
);

// Minimized Status Component
export const MinimizedStatus: React.FC<{
  sensingRadius: number;
  forceScale: number;
  maxSpeed: number;
  fps: number;
  onExpand: () => void;
  onClose: () => void;
}> = ({ sensingRadius, forceScale, maxSpeed, fps, onExpand, onClose }) => (
  <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded border border-white border-opacity-30 font-mono text-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="font-bold">Status</span>
      <div className="flex gap-2">
        <button
          onClick={onExpand}
          className="text-white hover:text-gray-300 text-lg leading-none"
        >
          ▲
        </button>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
    <div className="space-y-1">
      <div>Sensing Radius: {sensingRadius}</div>
      <div>Force Scale: {forceScale}</div>
      <div>Max Speed: {maxSpeed}</div>
      <div>FPS: {fps}</div>
    </div>
  </div>
);

// Modal Header Component
export const ModalHeader: React.FC<{
  onMinimize: () => void;
  onClose: () => void;
}> = ({ onMinimize, onClose }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-lg font-bold">Particle Life Controls</h2>
    <div className="flex gap-2">
      <button
        onClick={onMinimize}
        className="text-white hover:text-gray-300 text-lg leading-none"
      >
        ▼
      </button>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-300 text-lg leading-none"
      >
        ×
      </button>
    </div>
  </div>
);

// Simulation Parameters Component
export const SimulationParameters: React.FC<{
  particleCount: number;
  setParticleCount: (count: number) => void;
  colorCount: number;
  setColorCount: (count: number) => void;
  onRefresh: () => void;
}> = ({
  particleCount,
  setParticleCount,
  colorCount,
  setColorCount,
  onRefresh,
}) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold mb-3 border-b border-white border-opacity-30 pb-1">
      Simulation Parameters
    </h3>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-xs mb-1 opacity-80">Particle Count</label>
        <input
          type="number"
          value={particleCount}
          onChange={(e) => setParticleCount(parseInt(e.target.value))}
          min="100"
          max="10000"
          step="100"
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 opacity-80">Color Count</label>
        <input
          type="number"
          value={colorCount}
          onChange={(e) => setColorCount(parseInt(e.target.value))}
          min="2"
          max="12"
          step="1"
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
    <button
      onClick={onRefresh}
      className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 px-4 rounded border border-white border-opacity-30 transition-all duration-200 text-sm font-bold"
    >
      🔄 Refresh Simulation
    </button>
  </div>
);

// Matrix Cell Component
export const MatrixCell: React.FC<{
  value: number;
  rowColor: Color;
  colColor: Color;
  onClick: () => void;
}> = ({ value, rowColor, colColor, onClick }) => (
  <div
    className="flex items-center justify-center text-xs font-bold cursor-pointer rounded border border-white border-opacity-20 hover:scale-110 transition-transform duration-150"
    style={{
      backgroundColor: getColorForValue(value),
      color: getTextColor(value),
    }}
    onClick={onClick}
    title={`${rowColor.name} → ${colColor.name}: ${value.toFixed(1)}`}
  >
    {value.toFixed(1)}
  </div>
);

// Matrix Grid Component
export const MatrixGrid: React.FC<{
  matrix: number[][];
  colorCount: number;
  colors: Color[];
  onCellClick: (row: number, col: number) => void;
}> = ({ matrix, colorCount, colors, onCellClick }) => (
  <div
    className="grid gap-1 mb-3"
    style={{
      gridTemplateColumns: `30px repeat(${colorCount}, 25px)`,
      gridTemplateRows: `30px repeat(${colorCount}, 25px)`,
    }}
  >
    {/* Corner cell */}
    <div className="flex items-center justify-center text-xs bg-white bg-opacity-10 rounded">
      →
    </div>

    {/* Column headers */}
    {colors.slice(0, colorCount).map((color, i) => (
      <div
        key={`col-${i}`}
        className="flex items-center justify-center bg-white bg-opacity-10 rounded"
      >
        <div
          className="w-4 h-4 rounded-full border border-white"
          style={{ backgroundColor: color.hex }}
          title={color.name}
        />
      </div>
    ))}

    {/* Row headers and data cells */}
    {colors.slice(0, colorCount).map((rowColor, i) => (
      <React.Fragment key={`row-${i}`}>
        <div className="flex items-center justify-center bg-white bg-opacity-10 rounded">
          <div
            className="w-4 h-4 rounded-full border border-white"
            style={{ backgroundColor: rowColor.hex }}
            title={rowColor.name}
          />
        </div>

        {colors.slice(0, colorCount).map((colColor, j) => (
          <MatrixCell
            key={`cell-${i}-${j}`}
            value={matrix[i][j]}
            rowColor={rowColor}
            colColor={colColor}
            onClick={() => onCellClick(i, j)}
          />
        ))}
      </React.Fragment>
    ))}
  </div>
);

// Matrix Actions Component
export const MatrixActions: React.FC<{
  onRandomize: () => void;
  onClear: () => void;
  onSymmetric: () => void;
}> = ({ onRandomize, onClear, onSymmetric }) => (
  <div className="flex gap-2 flex-wrap">
    <button
      onClick={onRandomize}
      className="flex-1 bg-white bg-opacity-10 hover:bg-opacity-20 text-white py-1 px-2 rounded border border-white border-opacity-30 transition-all duration-200 text-xs"
    >
      Randomize
    </button>
    <button
      onClick={onClear}
      className="flex-1 bg-white bg-opacity-10 hover:bg-opacity-20 text-white py-1 px-2 rounded border border-white border-opacity-30 transition-all duration-200 text-xs"
    >
      Clear
    </button>
    <button
      onClick={onSymmetric}
      className="flex-1 bg-white bg-opacity-10 hover:bg-opacity-20 text-white py-1 px-2 rounded border border-white border-opacity-30 transition-all duration-200 text-xs"
    >
      Symmetric
    </button>
  </div>
);

// Interaction Matrix Component
export const InteractionMatrix: React.FC<{
  matrix: number[][];
  colorCount: number;
  colors: Color[];
  onCellClick: (row: number, col: number) => void;
  onRandomize: () => void;
  onClear: () => void;
  onSymmetric: () => void;
}> = ({
  matrix,
  colorCount,
  colors,
  onCellClick,
  onRandomize,
  onClear,
  onSymmetric,
}) => (
  <div className="mb-6">
    <h3 className="text-sm font-bold mb-3 border-b border-white border-opacity-30 pb-1">
      Interaction Rules Matrix
    </h3>

    {/* Legend */}
    <div className="flex items-center justify-between mb-3 text-xs">
      <span>Repulsion</span>
      <div
        className="flex-1 mx-3 h-3 rounded"
        style={{
          background:
            "linear-gradient(to right, rgb(255,0,0), rgb(255,255,255), rgb(0,255,0))",
        }}
      ></div>
      <span>Attraction</span>
    </div>

    <MatrixGrid
      matrix={matrix}
      colorCount={colorCount}
      colors={colors}
      onCellClick={onCellClick}
    />
    <MatrixActions
      onRandomize={onRandomize}
      onClear={onClear}
      onSymmetric={onSymmetric}
    />
  </div>
);

// Advanced Settings Component
export const AdvancedSettings: React.FC<{
  sensingRadius: number;
  setSensingRadius: (radius: number) => void;
  forceScale: number;
  setForceScale: (scale: number) => void;
  maxSpeed: number;
  setMaxSpeed: (speed: number) => void;
  damping: number;
  setDamping: (damping: number) => void;
  fps: number;
}> = ({
  sensingRadius,
  setSensingRadius,
  forceScale,
  setForceScale,
  maxSpeed,
  setMaxSpeed,
  damping,
  setDamping,
  fps,
}) => (
  <div className="mb-4">
    <h3 className="text-sm font-bold mb-3 border-b border-white border-opacity-30 pb-1">
      Advanced Settings
    </h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs mb-1 opacity-80">Sensing Radius</label>
        <input
          type="number"
          value={sensingRadius}
          onChange={(e) => setSensingRadius(parseInt(e.target.value))}
          min="20"
          max="200"
          step="10"
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 opacity-80">Force Scale</label>
        <input
          type="number"
          value={forceScale}
          onChange={(e) => setForceScale(parseInt(e.target.value))}
          min="50"
          max="500"
          step="25"
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 opacity-80">Max Speed</label>
        <input
          type="number"
          value={maxSpeed}
          onChange={(e) => setMaxSpeed(parseInt(e.target.value))}
          min="50"
          max="300"
          step="10"
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs mb-1 opacity-80">Damping</label>
        <input
          type="number"
          value={damping}
          onChange={(e) => setDamping(parseFloat(e.target.value))}
          min="0.9"
          max="1.0"
          step="0.01"
          className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded px-2 py-1 text-sm"
        />
      </div>
      <div className="flex items-end col-span-2">
        <div className="text-xs opacity-80">FPS: {fps}</div>
      </div>
    </div>
  </div>
);
