import React, { useState, useRef, useCallback, useEffect } from "react";
import { ControlPanelHeader } from "./ControlPanelHeader";
import { ControlPanelContent } from "./ControlPanelContent";

interface ControlPanelProps {
  particleCount: number;
  colorCount: number;
  sensingRadius: number;
  forceScale: number;
  maxSpeed: number;
  damping: number;
  colorMatrix: number[][];
  onParticleCountChange: (count: number) => void;
  onColorCountChange: (count: number) => void;
  onSensingRadiusChange: (radius: number) => void;
  onForceScaleChange: (scale: number) => void;
  onMaxSpeedChange: (speed: number) => void;
  onDampingChange: (damping: number) => void;
  onMatrixUpdate: (matrix: number[][]) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  particleCount,
  colorCount,
  sensingRadius,
  forceScale,
  maxSpeed,
  damping,
  colorMatrix,
  onParticleCountChange,
  onColorCountChange,
  onSensingRadiusChange,
  onForceScaleChange,
  onMaxSpeedChange,
  onDampingChange,
  onMatrixUpdate,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !panelRef.current) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Keep panel within viewport bounds
      const panelRect = panelRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - panelRect.width - 20;
      const maxY = window.innerHeight - panelRect.height - 20;

      setPosition({
        x: Math.max(20, Math.min(maxX, newX)),
        y: Math.max(20, Math.min(maxY, newY)),
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: position.x, // Changed from right to left
    top: position.y,
    background: "rgba(20, 20, 30, 0.95)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    color: "white",
    fontFamily: "monospace",
    width: isMinimized ? "auto" : "320px",
    maxWidth: "90vw",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
    transition: "width 0.3s ease",
    cursor: isDragging ? "move" : "default",
    userSelect: "none",
    zIndex: 100,
  };

  return (
    <div ref={panelRef} style={panelStyle}>
      <ControlPanelHeader
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        onMouseDown={handleMouseDown}
        particleCount={particleCount}
        colorCount={colorCount}
      />
      {!isMinimized && (
        <ControlPanelContent
          particleCount={particleCount}
          colorCount={colorCount}
          colorMatrix={colorMatrix}
          onParticleCountChange={onParticleCountChange}
          onColorCountChange={onColorCountChange}
          onMatrixUpdate={onMatrixUpdate}
        />
      )}
    </div>
  );
};
