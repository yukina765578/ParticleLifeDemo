import React from "react";

interface ControlPanelHeaderProps {
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  particleCount: number;
  colorCount: number;
}

export const ControlPanelHeader: React.FC<ControlPanelHeaderProps> = ({
  isMinimized,
  onToggleMinimize,
  onMouseDown,
  particleCount,
  colorCount,
}) => {
  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    cursor: "move",
    userSelect: "none",
    borderBottom: isMinimized ? "none" : "1px solid rgba(255, 255, 255, 0.1)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    margin: 0,
    flex: 1,
  };

  const statusStyle: React.CSSProperties = {
    fontSize: "12px",
    opacity: 0.7,
    marginLeft: "12px",
  };

  const buttonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    padding: "4px 8px",
    fontSize: "16px",
    opacity: 0.7,
    transition: "opacity 0.2s",
    marginLeft: "8px",
  };

  return (
    <div style={headerStyle} onMouseDown={onMouseDown}>
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <h3 style={titleStyle}>Controls</h3>
        {isMinimized && (
          <span style={statusStyle}>
            {particleCount} particles • {colorCount} colors
          </span>
        )}
      </div>
      <button
        style={buttonStyle}
        onClick={onToggleMinimize}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        {isMinimized ? "▼" : "▲"}
      </button>
    </div>
  );
};
