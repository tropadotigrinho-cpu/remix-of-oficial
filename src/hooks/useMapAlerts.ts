import { useState, useMemo } from "react";
import { ALERTS, type Alert } from "@/components/ironguard/constants";

interface GeoJSONFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

// Campinas center
const CAMPINAS_LNG = -47.0626;
const CAMPINAS_LAT = -22.9064;

export function useMapAlerts(
  userPlan: "free" | "pro",
  userCoords: [number, number] | null,
  activeFilters: string[]
) {
  const [alerts] = useState<Alert[]>(ALERTS);

  const filteredAlerts = useMemo(() => {
    let result = alerts;
    if (activeFilters.length > 0) {
      result = result.filter((a) => activeFilters.includes(a.type));
    }
    return result;
  }, [alerts, activeFilters]);

  const geojson = useMemo<GeoJSONCollection>(() => {
    return {
      type: "FeatureCollection",
      features: filteredAlerts.map((a) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [
            CAMPINAS_LNG + ((a.x - 50) / 100) * 0.08,
            CAMPINAS_LAT + ((a.y - 50) / 100) * 0.06,
          ] as [number, number],
        },
        properties: {
          id: a.id,
          type: a.type,
          title: a.t,
          icon: a.ic,
          color: a.color,
          bairro: a.bairro,
          ago: a.ago,
          dist: a.dist,
          votes: a.v,
          isNew: a.isNew || false,
          plate: a.plate || "",
          model: a.model || "",
        },
      })),
    };
  }, [filteredAlerts]);

  return { alerts: filteredAlerts, geojson };
}
