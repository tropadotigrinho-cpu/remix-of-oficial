import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import MapCore, { type MapCoreHandle } from "./MapCore";
import MapControls from "./MapControls";
import MapChatModal from "./MapChatModal";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMapAlerts } from "@/hooks/useMapAlerts";
import { SP_CENTER } from "@/lib/mapConstants";
import { DEFAULT_ON } from "@/components/ironguard/constants";

const MapImersivo3D = lazy(() => import("./MapImersivo3D"));

interface MapOrchestratorProps {
  activeFilters?: string[];
  onPinClick?: (alert: Record<string, unknown>) => void;
}

export default function MapOrchestrator({
  activeFilters = DEFAULT_ON,
  onPinClick,
}: MapOrchestratorProps) {
  const [modo, setModo] = useState<"2d" | "3d">("2d");
  const [heatmapActive, setHeatmapActive] = useState(true);
  const [compassBearing, setCompassBearing] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const mapCoreRef = useRef<MapCoreHandle>(null);

  const userPlan = useUserPlan();
  const isPro = userPlan === "pro";
  const { location, tracking, startTracking } = useUserLocation();

  // Auto-start GPS tracking on mount
  useEffect(() => {
    startTracking();
  }, [startTracking]);

  const userCoords: [number, number] | null = location
    ? [location.longitude, location.latitude]
    : null;

  const { geojson } = useMapAlerts(userPlan, userCoords, activeFilters);

  const handleCentralizar = useCallback(() => {
    if (!tracking) startTracking();
    if (userCoords) {
      mapCoreRef.current?.flyTo(userCoords, 15);
    } else {
      mapCoreRef.current?.flyTo(SP_CENTER);
    }
  }, [userCoords, tracking, startTracking]);

  const handleToggleHeatmap = useCallback(() => {
    setHeatmapActive((prev) => {
      mapCoreRef.current?.setHeatmapVisible(!prev);
      return !prev;
    });
  }, []);

  const handleResetNorth = useCallback(() => {
    const map = mapCoreRef.current?.getMap();
    if (map) {
      map.easeTo({ bearing: 0, duration: 400 });
    }
  }, []);

  const handleMapMove = useCallback(() => {
    const map = mapCoreRef.current?.getMap();
    if (map) {
      setCompassBearing(map.getBearing());
    }
  }, []);

  return (
    <>
      <MapCore
        ref={mapCoreRef}
        visible={modo === "2d"}
        onPinClick={onPinClick}
        onMapMove={handleMapMove}
        userPlan={userPlan}
        alertsGeoJSON={geojson}
        userCoords={userCoords}
      />

      {modo === "3d" && (
        <Suspense
          fallback={
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(6,8,14,0.95)", color: "rgba(238,242,250,0.5)", fontSize: 13, zIndex: 5 }}>
              Carregando modo 3D...
            </div>
          }
        >
          <MapImersivo3D onExit={() => setModo("2d")} />
        </Suspense>
      )}

      <MapControls
        modo={modo}
        isPro={isPro}
        onToggle3D={() => setModo((m) => (m === "2d" ? "3d" : "2d"))}
        onCentralizar={handleCentralizar}
        onToggleHeatmap={handleToggleHeatmap}
        heatmapActive={heatmapActive}
        compassBearing={compassBearing}
        onResetNorth={handleResetNorth}
        onOpenChat={() => setChatOpen(true)}
        gpsActive={tracking && !!userCoords}
      />

      <MapChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
