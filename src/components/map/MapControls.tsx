import { D } from "@/components/ironguard/constants";

interface MapControlsProps {
  modo: "2d" | "3d";
  isPro: boolean;
  onToggle3D: () => void;
  onCentralizar: () => void;
  onToggleHeatmap: () => void;
  heatmapActive: boolean;
  onToggleLayers?: () => void;
  compassBearing?: number;
  onResetNorth?: () => void;
}

export default function MapControls({
  modo,
  isPro,
  onToggle3D,
  onCentralizar,
  onToggleHeatmap,
  heatmapActive,
  onToggleLayers,
  compassBearing = 0,
  onResetNorth,
}: MapControlsProps) {
  const btnBase: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "rgba(6,8,14,0.9)",
    border: `1px solid ${D.border}`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(12px)",
    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
    transition: "all 0.2s",
    fontFamily: "inherit",
    fontSize: 18,
    padding: 0,
  };

  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        bottom: 80,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Compass */}
      <button
        style={{ ...btnBase, color: D.sub }}
        onClick={onResetNorth}
        title="Norte"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          style={{ transform: `rotate(${-compassBearing}deg)`, transition: "transform 0.3s" }}
        >
          <path d="M10 2L13 10L10 8L7 10L10 2Z" fill="#FF3232" />
          <path d="M10 18L7 10L10 12L13 10L10 18Z" fill="rgba(238,242,250,0.3)" />
        </svg>
      </button>

      {/* Layers */}
      <button
        style={{ ...btnBase, color: D.sub }}
        onClick={onToggleLayers}
        title="Camadas"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* 3D Toggle */}
      <button
        style={{
          ...btnBase,
          color: modo === "3d" ? D.blue : D.sub,
          background: modo === "3d" ? `${D.blue}1A` : btnBase.background,
          border: modo === "3d" ? `1px solid ${D.blue}40` : btnBase.border,
          boxShadow: modo === "3d"
            ? `0 0 20px ${D.blue}30, 0 4px 16px rgba(0,0,0,0.4)`
            : btnBase.boxShadow,
        }}
        onClick={onToggle3D}
        title="Modo 3D"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3L2 8l10 5 10-5-10-5z" />
          <path d="M2 16l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* Heatmap */}
      <button
        style={{
          ...btnBase,
          color: heatmapActive ? D.red : D.sub,
          background: heatmapActive ? `${D.red}1A` : btnBase.background,
          border: heatmapActive ? `1px solid ${D.red}40` : btnBase.border,
        }}
        onClick={onToggleHeatmap}
        title="Heatmap"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22c-4.97 0-9-2.686-9-6v0c0-4 4.5-9.5 9-14 4.5 4.5 9 10 9 14v0c0 3.314-4.03 6-9 6z" />
        </svg>
      </button>

      {/* GPS / Centralize */}
      <button
        style={{
          ...btnBase,
          color: D.blue,
        }}
        onClick={onCentralizar}
        title="Centralizar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      </button>
    </div>
  );
}
