import { useState, useEffect, useRef, useMemo } from "react";
import { ALERTS, type Alert } from "@/components/ironguard/constants";
import { RAIO_FREE_M, RAIO_PRO_M } from "@/lib/mapConstants";
import * as turf from "@turf/turf";

interface GeoJSONFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

interface GeoJSONCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

/**
 * Provides alerts as GeoJSON, filtered by plan radius.
 * Currently uses mock data. When Supabase tables are ready,
 * this will subscribe to Realtime channels.
 */
export function useMapAlerts(
  userPlan: "free" | "pro",
  userCoords: [number, number] | null,
  activeFilters: string[]
) {
  const [alerts] = useState<Alert[]>(ALERTS);

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    // Filter by type
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
          // Convert percentage positions to approximate lng/lat around SP center
          coordinates: [
            -46.6333 + ((a.x - 50) / 100) * 0.08,
            -23.5505 + ((a.y - 50) / 100) * 0.06,
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
