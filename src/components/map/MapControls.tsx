import { D } from "@/components/ironguard/constants";

interface MapControlsProps {
  modo: "2d" | "3d";
  isPro: boolean;
  onToggle3D: () => void;
  onCentralizar: () => void;
  onToggleHeatmap: () => void;
  heatmapActive: boolean;
  compassBearing?: number;
  onResetNorth?: () => void;
  onOpenChat?: () => void;
}

export default function MapControls({
  modo,
  onToggle3D,
  onCentralizar,
  onToggleHeatmap,
  heatmapActive,
  compassBearing = 0,
  onResetNorth,
  onOpenChat,
}: MapControlsProps) {
  const btnBase: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(11,16,24,0.85)",
    border: `1px solid ${D.border}`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(16px)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    transition: "all 0.2s",
    fontFamily: "inherit",
    fontSize: 18,
    padding: 0,
    color: "rgba(238,242,250,0.4)",
  };

  const activeStyle = (color: string, active: boolean): React.CSSProperties =>
    active
      ? {
          ...btnBase,
          color,
          background: `${color}12`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 12px ${color}18, 0 2px 8px rgba(0,0,0,0.3)`,
        }
      : btnBase;

  return (
    <div
      style={{
        position: "absolute",
        right: 14,
        bottom: 80,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {/* Compass */}
      <button
        style={btnBase}
        onClick={onResetNorth}
        title="Norte"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          style={{ transform: `rotate(${-compassBearing}deg)`, transition: "transform 0.3s" }}
        >
          <path d="M10 2L13 10L10 8L7 10L10 2Z" fill="#FF3232" />
          <path d="M10 18L7 10L10 12L13 10L10 18Z" fill="rgba(238,242,250,0.25)" />
        </svg>
      </button>

      {/* 3D Toggle */}
      <button
        style={activeStyle(D.blue, modo === "3d")}
        onClick={onToggle3D}
        title="Modo 3D"
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>3D</span>
      </button>

      {/* Heatmap / Gradient toggle */}
      <button
        style={activeStyle(D.red, heatmapActive)}
        onClick={onToggleHeatmap}
        title={heatmapActive ? "Desativar raios" : "Ativar raios"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7" opacity="0.5" />
          <circle cx="12" cy="12" r="10" opacity="0.25" />
        </svg>
      </button>

      {/* GPS */}
      <button
        style={{ ...btnBase, color: D.blue }}
        onClick={onCentralizar}
        title="Minha localização"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      {/* Chat de bordo */}
      <button
        style={{ ...btnBase, color: D.teal }}
        onClick={onOpenChat}
        title="Chat IA"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
