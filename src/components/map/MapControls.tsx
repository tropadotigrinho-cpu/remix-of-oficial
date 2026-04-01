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
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "rgba(15,21,32,0.75)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    fontSize: 13,
    padding: 0,
    color: "rgba(238,242,250,0.4)",
  };

  const active = (on: boolean): React.CSSProperties =>
    on
      ? {
          ...btnBase,
          color: "rgba(238,242,250,0.9)",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
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
      <button style={btnBase} onClick={onResetNorth} title="Norte">
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          style={{ transform: `rotate(${-compassBearing}deg)`, transition: "transform 0.3s" }}
        >
          <path d="M10 2L13 10L10 8L7 10L10 2Z" fill="#FF4444" />
          <path d="M10 18L7 10L10 12L13 10L10 18Z" fill="rgba(238,242,250,0.15)" />
        </svg>
      </button>

      {/* 3D */}
      <button style={active(modo === "3d")} onClick={onToggle3D} title="Modo 3D">
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>3D</span>
      </button>

      {/* Heatmap */}
      <button style={active(heatmapActive)} onClick={onToggleHeatmap} title={heatmapActive ? "Ocultar raios" : "Mostrar raios"}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="7" opacity="0.35" />
          <circle cx="12" cy="12" r="10" opacity="0.15" />
        </svg>
      </button>

      {/* GPS */}
      <button style={active(gpsActive)} onClick={onCentralizar} title="Localização">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>

      {/* Chat */}
      <button style={btnBase} onClick={onOpenChat} title="Chat IA">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
