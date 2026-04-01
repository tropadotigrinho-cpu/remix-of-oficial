import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  memo,
  useCallback,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  SP_CENTER,
  SP_BOUNDS,
  ZOOM_DEFAULT,
  ZOOM_MIN,
  ZOOM_MAX,
  RAIO_FREE_M,
  RAIO_PRO_M,
} from "@/lib/mapConstants";
import { getMapStyle, injectPMTilesSource } from "@/lib/mapStyle";
import { getMapTilerStyle } from "@/lib/mapFallback";
import { registerPMTilesProtocol } from "@/lib/mapProtocol";
import * as turf from "@turf/turf";

export interface MapCoreHandle {
  getMap: () => maplibregl.Map | null;
  flyTo: (center: [number, number], zoom?: number) => void;
  setHeatmapVisible: (visible: boolean) => void;
}

interface MapCoreProps {
  visible: boolean;
  onReady?: () => void;
  onPinClick?: (alert: Record<string, unknown>) => void;
  onMapMove?: (bounds: maplibregl.LngLatBounds) => void;
  userPlan: "free" | "pro";
  alertsGeoJSON?: GeoJSON.FeatureCollection;
  userCoords?: [number, number] | null;
}

// Heatmap color ramps per occurrence type
const HEATMAP_COLORS: Record<string, string> = {
  roubo: "#FF3232",
  assalto: "#FF2D78",
  acidente: "#FF7A00",
  alagamento: "#3D8EFF",
  perigo: "#FFD000",
  furto: "#9D6FFF",
  blitz: "#3D8EFF",
  transito: "#FF7A00",
  obra: "#FFD000",
  incendio: "#FF3232",
  veiculo_suspeito: "#FF2D78",
  ajuda: "#00D4C8",
  caça: "#22D46A",
  zona: "#9D6FFF",
};

const MapCore = memo(
  forwardRef<MapCoreHandle, MapCoreProps>(
    ({ visible, onReady, onPinClick, onMapMove, userPlan, alertsGeoJSON, userCoords }, ref) => {
      const divRef = useRef<HTMLDivElement>(null);
      const mapRef = useRef<maplibregl.Map | null>(null);
      const readyRef = useRef(false);
      const moveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
      const userMarkerRef = useRef<maplibregl.Marker | null>(null);
      const heatLayersRef = useRef<string[]>([]);

      useImperativeHandle(ref, () => ({
        getMap: () => mapRef.current,
        flyTo: (center, zoom) => {
          mapRef.current?.flyTo({ center, zoom: zoom || ZOOM_DEFAULT, duration: 800 });
        },
        setHeatmapVisible: (vis) => {
          if (!mapRef.current) return;
          // Toggle all heatmap layers
          heatLayersRef.current.forEach((id) => {
            try {
              mapRef.current!.setLayoutProperty(id, "visibility", vis ? "visible" : "none");
            } catch { /* ignore */ }
          });
        },
      }));

      useEffect(() => {
        if (!divRef.current || mapRef.current) return;

        registerPMTilesProtocol();

        const initMap = async () => {
          let style: string | maplibregl.StyleSpecification;

          try {
            const cached = await getMapStyle();
            if (cached) {
              style = injectPMTilesSource(cached as Record<string, unknown>) as unknown as maplibregl.StyleSpecification;
            } else {
              style = getMapTilerStyle();
            }
          } catch {
            style = getMapTilerStyle();
          }

          const map = new maplibregl.Map({
            container: divRef.current!,
            style,
            center: SP_CENTER,
            zoom: ZOOM_DEFAULT,
            minZoom: ZOOM_MIN,
            maxZoom: ZOOM_MAX,
            maxBounds: SP_BOUNDS,
            antialias: true,
            pitchWithRotate: false,
            trackResize: true,
          });

          mapRef.current = map;

          map.on("load", () => {
            readyRef.current = true;

            // ── User radius circle ──
            const radiusM = userPlan === "pro" ? RAIO_PRO_M : RAIO_FREE_M;
            const center = userCoords || SP_CENTER;
            const circle = turf.circle(center, radiusM / 1000, { steps: 64, units: "kilometers" });

            map.addSource("user-radius", { type: "geojson", data: circle });
            map.addLayer({
              id: "user-radius-fill",
              type: "fill",
              source: "user-radius",
              paint: { "fill-color": "#00D4FF", "fill-opacity": 0.03 },
            });
            map.addLayer({
              id: "user-radius-line",
              type: "line",
              source: "user-radius",
              paint: { "line-color": "#00D4FF", "line-opacity": 0.15, "line-width": 1, "line-dasharray": [4, 4] },
            });

            // ── Zonas de risco — somente roubo de carro/moto, gradiente concêntrico visível ──
            const zonasDef = [
              { center: [-47.060, -22.900] as [number, number], r: 0.8, density: 5, nome: "Centro" },
              { center: [-47.045, -22.895] as [number, number], r: 0.6, density: 4, nome: "Cambuí" },
              { center: [-47.040, -22.875] as [number, number], r: 0.5, density: 2, nome: "Taquaral" },
              { center: [-47.085, -22.860] as [number, number], r: 0.7, density: 5, nome: "Barão Geraldo" },
              { center: [-47.070, -22.910] as [number, number], r: 0.45, density: 3, nome: "Bosque" },
            ];

            // Each zone gets multiple concentric points for a denser gradient core
            zonasDef.forEach((z, i) => {
              const srcId = `zona-heat-${i}`;
              const layerId = `zona-heat-layer-${i}`;
              // Create concentric points — more points at center = denser core
              const pts: GeoJSON.Feature[] = [];
              pts.push({ type: "Feature", geometry: { type: "Point", coordinates: z.center }, properties: { w: z.density } });
              // Add ring of secondary points for spread
              for (let angle = 0; angle < 360; angle += 60) {
                const offset = z.r * 0.3 / 111;
                const lng = z.center[0] + offset * Math.cos((angle * Math.PI) / 180);
                const lat = z.center[1] + offset * Math.sin((angle * Math.PI) / 180);
                pts.push({ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { w: z.density * 0.5 } });
              }

              map.addSource(srcId, {
                type: "geojson",
                data: { type: "FeatureCollection", features: pts },
              });
              map.addLayer({
                id: layerId,
                type: "heatmap",
                source: srcId,
                paint: {
                  "heatmap-weight": ["get", "w"],
                  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 14, 1.2],
                  "heatmap-color": [
                    "interpolate", ["linear"], ["heatmap-density"],
                    0,    "rgba(0,0,0,0)",
                    0.1,  "rgba(255,50,50,0.05)",
                    0.25, "rgba(255,50,50,0.15)",
                    0.4,  "rgba(255,40,40,0.3)",
                    0.55, "rgba(255,30,30,0.45)",
                    0.7,  "rgba(200,20,20,0.6)",
                    0.85, "rgba(160,10,10,0.75)",
                    1,    "rgba(130,0,0,0.9)",
                  ],
                  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, z.r * 80, 13, z.r * 160, 16, z.r * 280],
                  "heatmap-opacity": 0.75,
                },
              });
            });

            // ── Build heatmap layers per type ──
            buildHeatmapLayers(map, alertsGeoJSON);

            // ── Alert pins (clustered) ──
            map.addSource("alert-pins", {
              type: "geojson",
              data: alertsGeoJSON || { type: "FeatureCollection", features: [] },
              cluster: true,
              clusterMaxZoom: 13,
              clusterRadius: 50,
            });

            // Clusters — minimal military style
            map.addLayer({
              id: "alert-clusters",
              type: "circle",
              source: "alert-pins",
              filter: ["has", "point_count"],
              paint: {
                "circle-color": "rgba(0,0,0,0.5)",
                "circle-radius": ["step", ["get", "point_count"], 18, 5, 24, 10, 30],
                "circle-opacity": 1,
                "circle-stroke-width": 1,
                "circle-stroke-color": "rgba(0,212,255,0.4)",
              },
            });

            map.addLayer({
              id: "alert-cluster-count",
              type: "symbol",
              source: "alert-pins",
              filter: ["has", "point_count"],
              layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 11, "text-font": ["Open Sans Bold"] },
              paint: { "text-color": "#00D4FF" },
            });

            // Pin — EMOJI ONLY, no colored circles
            map.addLayer({
              id: "alert-unclustered-icon",
              type: "symbol",
              source: "alert-pins",
              filter: ["!", ["has", "point_count"]],
              layout: {
                "text-field": ["get", "icon"],
                "text-size": 22,
                "text-allow-overlap": true,
                "text-anchor": "center",
                "text-offset": [0, 0],
              },
            });

            // Invisible circle for click events on pins
            map.addLayer({
              id: "alert-unclustered",
              type: "circle",
              source: "alert-pins",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-radius": 16,
                "circle-color": "rgba(0,0,0,0)",
                "circle-opacity": 0,
              },
            });

            // ── Events ──
            map.on("click", "alert-clusters", (e) => {
              const features = map.queryRenderedFeatures(e.point, { layers: ["alert-clusters"] });
              if (!features.length) return;
              const clusterId = features[0].properties?.cluster_id;
              const source = map.getSource("alert-pins") as maplibregl.GeoJSONSource;
              source.getClusterExpansionZoom(clusterId).then((zoom) => {
                map.easeTo({
                  center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
                  zoom: zoom!,
                  duration: 500,
                });
              });
            });

            map.on("click", "alert-unclustered", (e) => {
              if (!e.features?.length) return;
              onPinClick?.(e.features[0].properties as Record<string, unknown>);
            });

            map.on("mouseenter", "alert-unclustered", () => { map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "alert-unclustered", () => { map.getCanvas().style.cursor = ""; });
            map.on("mouseenter", "alert-clusters", () => { map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "alert-clusters", () => { map.getCanvas().style.cursor = ""; });

            onReady?.();
          });

          map.on("moveend", () => {
            clearTimeout(moveTimeoutRef.current);
            moveTimeoutRef.current = setTimeout(() => {
              if (mapRef.current) onMapMove?.(mapRef.current.getBounds());
            }, 400);
          });
        };

        initMap();
        return () => { clearTimeout(moveTimeoutRef.current); };
      }, []); // eslint-disable-line react-hooks/exhaustive-deps

      // Build military-style heatmap layers per occurrence type — concentric gradients
      const buildHeatmapLayers = useCallback((map: maplibregl.Map, geojson?: GeoJSON.FeatureCollection) => {
        // Remove old heatmap layers/sources
        heatLayersRef.current.forEach((id) => {
          try { map.removeLayer(id); } catch { /* */ }
          try { map.removeSource(id); } catch { /* */ }
        });
        heatLayersRef.current = [];

        if (!geojson) return;

        // Group features by type
        const byType: Record<string, GeoJSON.Feature[]> = {};
        geojson.features.forEach((f) => {
          const t = (f.properties as any)?.type || "unknown";
          if (!byType[t]) byType[t] = [];
          byType[t].push(f);
        });

        Object.entries(byType).forEach(([type, features]) => {
          const color = HEATMAP_COLORS[type] || "#FF3232";
          const sourceId = `heatmap-${type}`;
          const layerId = `heatmap-layer-${type}`;

          map.addSource(sourceId, {
            type: "geojson",
            data: { type: "FeatureCollection", features },
          });

          // Military-grade heatmap: tight core → wide diffuse edge, low opacity
          map.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            maxzoom: 16,
            paint: {
              "heatmap-weight": ["interpolate", ["linear"], ["get", "votes"], 0, 0.3, 6, 0.7, 12, 1],
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.4, 13, 0.8, 16, 1.5],
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0,    "rgba(0,0,0,0)",
                0.05, `${color}08`,
                0.15, `${color}15`,
                0.3,  `${color}28`,
                0.5,  `${color}45`,
                0.7,  `${color}70`,
                0.85, `${color}A0`,
                1,    `${color}D0`,
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 30, 13, 55, 16, 80],
              "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.7, 14, 0.5, 16, 0.35],
            },
          });

          heatLayersRef.current.push(layerId);
        });
      }, []);

      // Update alerts GeoJSON
      useEffect(() => {
        if (!mapRef.current || !readyRef.current || !alertsGeoJSON) return;

        try {
          const pinSource = mapRef.current.getSource("alert-pins") as maplibregl.GeoJSONSource;
          pinSource?.setData(alertsGeoJSON);

          // Rebuild heatmap layers
          buildHeatmapLayers(mapRef.current, alertsGeoJSON);
        } catch { /* sources may not exist yet */ }
      }, [alertsGeoJSON, buildHeatmapLayers]);

      // Update user location marker
      useEffect(() => {
        if (!mapRef.current || !readyRef.current || !userCoords) return;

        if (!userMarkerRef.current) {
          const el = document.createElement("div");
          el.className = "ig-user-marker";
          el.innerHTML = `<div class="ig-user-pulse"></div><div class="ig-user-dot"></div>`;
          userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(userCoords)
            .addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLngLat(userCoords);
        }

        try {
          const radiusM = userPlan === "pro" ? RAIO_PRO_M : RAIO_FREE_M;
          const circle = turf.circle(userCoords, radiusM / 1000, { steps: 64, units: "kilometers" });
          const source = mapRef.current.getSource("user-radius") as maplibregl.GeoJSONSource;
          source?.setData(circle);
        } catch { /* ignore */ }
      }, [userCoords, userPlan]);

      return (
        <div
          ref={divRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
        />
      );
    }
  )
);

MapCore.displayName = "MapCore";
export default MapCore;
