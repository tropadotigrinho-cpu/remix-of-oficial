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
  gpsActive?: boolean;
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
  gpsActive = false,
}: MapControlsProps) {
  const btnBase: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(11,16,24,0.7)",
    border: "1px solid transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    transition: "all 0.2s",
    fontFamily: "inherit",
    fontSize: 14,
    padding: 0,
    color: "rgba(238,242,250,0.35)",
    boxShadow: "none",
  };

  const activeStyle = (color: string, active: boolean): React.CSSProperties =>
    active
      ? {
          ...btnBase,
          color,
          background: `${color}0A`,
          boxShadow: `0 0 10px ${color}30`,
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
        gap: 8,
      }}
    >
      {/* Compass */}
      <button style={btnBase} onClick={onResetNorth} title="Norte">
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          style={{ transform: `rotate(${-compassBearing}deg)`, transition: "transform 0.3s" }}
        >
          <path d="M10 2L13 10L10 8L7 10L10 2Z" fill="#FF3232" />
          <path d="M10 18L7 10L10 12L13 10L10 18Z" fill="rgba(238,242,250,0.2)" />
        </svg>
      </button>

      {/* 3D Toggle */}
      <button
        style={activeStyle(D.blue, modo === "3d")}
        onClick={onToggle3D}
        title="Modo 3D"
      >
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>3D</span>
      </button>

      {/* Heatmap toggle */}
      <button
        style={activeStyle(D.red, heatmapActive)}
        onClick={onToggleHeatmap}
        title={heatmapActive ? "Desativar raios" : "Ativar raios"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7" opacity="0.4" />
          <circle cx="12" cy="12" r="10" opacity="0.2" />
        </svg>
      </button>

      {/* GPS */}
      <button
        style={activeStyle(D.blue, gpsActive)}
        onClick={onCentralizar}
        title="Minha localização"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      {/* Chat */}
      <button
        style={{ ...btnBase, color: "rgba(0,209,255,0.5)" }}
        onClick={onOpenChat}
        title="Chat IA"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
