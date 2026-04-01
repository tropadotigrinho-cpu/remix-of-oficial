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

// Subtle, desaturated colors per type — Uber/99 style
const HEATMAP_COLORS: Record<string, [number, number, number]> = {
  roubo:            [255, 60, 60],
  assalto:          [255, 55, 120],
  acidente:         [255, 140, 40],
  alagamento:       [60, 140, 255],
  perigo:           [255, 200, 40],
  furto:            [140, 100, 255],
  blitz:            [60, 140, 255],
  transito:         [255, 140, 40],
  obra:             [255, 200, 40],
  incendio:         [255, 60, 60],
  veiculo_suspeito: [255, 55, 120],
  ajuda:            [0, 200, 190],
  caça:             [34, 200, 106],
  zona:             [140, 100, 255],
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

            // ── User radius — subtle, no dashes ──
            const radiusM = userPlan === "pro" ? RAIO_PRO_M : RAIO_FREE_M;
            const center = userCoords || SP_CENTER;
            const circle = turf.circle(center, radiusM / 1000, { steps: 64, units: "kilometers" });

            map.addSource("user-radius", { type: "geojson", data: circle });
            map.addLayer({
              id: "user-radius-fill",
              type: "fill",
              source: "user-radius",
              paint: { "fill-color": "#3D8EFF", "fill-opacity": 0.04 },
            });
            map.addLayer({
              id: "user-radius-line",
              type: "line",
              source: "user-radius",
              paint: { "line-color": "#3D8EFF", "line-opacity": 0.12, "line-width": 0.8 },
            });

            // ── Risk zones — soft radial gradient heatmap ──
            const zonasDef = [
              { center: [-47.060, -22.900] as [number, number], r: 1.0, density: 6 },
              { center: [-47.045, -22.895] as [number, number], r: 0.7, density: 4 },
              { center: [-47.040, -22.875] as [number, number], r: 0.5, density: 2 },
              { center: [-47.085, -22.860] as [number, number], r: 0.8, density: 5 },
              { center: [-47.070, -22.910] as [number, number], r: 0.5, density: 3 },
            ];

            zonasDef.forEach((z, i) => {
              const srcId = `zona-heat-${i}`;
              const layerId = `zona-heat-layer-${i}`;
              const pts: GeoJSON.Feature[] = [];
              // Dense core with falloff rings
              pts.push({ type: "Feature", geometry: { type: "Point", coordinates: z.center }, properties: { w: z.density } });
              for (let ring = 1; ring <= 3; ring++) {
                for (let angle = 0; angle < 360; angle += 45) {
                  const offset = z.r * ring * 0.15 / 111;
                  const lng = z.center[0] + offset * Math.cos((angle * Math.PI) / 180);
                  const lat = z.center[1] + offset * Math.sin((angle * Math.PI) / 180);
                  pts.push({ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { w: z.density * (1 - ring * 0.25) } });
                }
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
                  "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 14, 1.0],
                  "heatmap-color": [
                    "interpolate", ["linear"], ["heatmap-density"],
                    0,    "rgba(0,0,0,0)",
                    0.1,  "rgba(255,50,50,0.04)",
                    0.25, "rgba(255,40,40,0.10)",
                    0.45, "rgba(255,30,30,0.18)",
                    0.65, "rgba(220,20,20,0.28)",
                    0.8,  "rgba(180,10,10,0.38)",
                    0.9,  "rgba(150,0,0,0.48)",
                    1,    "rgba(120,0,0,0.55)",
                  ],
                  "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, z.r * 60, 13, z.r * 120, 16, z.r * 200],
                  "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.9, 15, 0.6, 17, 0.4],
                },
              });
            });

            // ── Per-type heatmap ──
            buildHeatmapLayers(map, alertsGeoJSON);

            // ── Alert pins (clustered) ──
            map.addSource("alert-pins", {
              type: "geojson",
              data: alertsGeoJSON || { type: "FeatureCollection", features: [] },
              cluster: true,
              clusterMaxZoom: 13,
              clusterRadius: 50,
            });

            // Clusters — clean pill style
            map.addLayer({
              id: "alert-clusters",
              type: "circle",
              source: "alert-pins",
              filter: ["has", "point_count"],
              paint: {
                "circle-color": "rgba(15,21,32,0.85)",
                "circle-radius": ["step", ["get", "point_count"], 16, 5, 20, 10, 26],
                "circle-opacity": 1,
                "circle-stroke-width": 0.5,
                "circle-stroke-color": "rgba(255,255,255,0.08)",
              },
            });

            map.addLayer({
              id: "alert-cluster-count",
              type: "symbol",
              source: "alert-pins",
              filter: ["has", "point_count"],
              layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 11, "text-font": ["Open Sans Bold"] },
              paint: { "text-color": "rgba(238,242,250,0.7)" },
            });

            // Pin — emoji only, clean
            map.addLayer({
              id: "alert-unclustered-icon",
              type: "symbol",
              source: "alert-pins",
              filter: ["!", ["has", "point_count"]],
              layout: {
                "text-field": ["get", "icon"],
                "text-size": 20,
                "text-allow-overlap": true,
                "text-anchor": "center",
                "text-offset": [0, 0],
              },
            });

            // Invisible hit area
            map.addLayer({
              id: "alert-unclustered",
              type: "circle",
              source: "alert-pins",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-radius": 18,
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

      // Per-type heatmap — subtle ambient glow
      const buildHeatmapLayers = useCallback((map: maplibregl.Map, geojson?: GeoJSON.FeatureCollection) => {
        heatLayersRef.current.forEach((id) => {
          try { map.removeLayer(id); } catch { /* */ }
          try { map.removeSource(id); } catch { /* */ }
        });
        heatLayersRef.current = [];

        if (!geojson) return;

        const byType: Record<string, GeoJSON.Feature[]> = {};
        geojson.features.forEach((f) => {
          const t = (f.properties as any)?.type || "unknown";
          if (!byType[t]) byType[t] = [];
          byType[t].push(f);
        });

        Object.entries(byType).forEach(([type, features]) => {
          const rgb = HEATMAP_COLORS[type] || [255, 60, 60];
          const [r, g, b] = rgb;
          const sourceId = `heatmap-${type}`;
          const layerId = `heatmap-layer-${type}`;

          map.addSource(sourceId, {
            type: "geojson",
            data: { type: "FeatureCollection", features },
          });

          map.addLayer({
            id: layerId,
            type: "heatmap",
            source: sourceId,
            maxzoom: 16,
            paint: {
              "heatmap-weight": ["interpolate", ["linear"], ["get", "votes"], 0, 0.3, 6, 0.6, 12, 1],
              "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.3, 13, 0.6, 16, 1.0],
              "heatmap-color": [
                "interpolate", ["linear"], ["heatmap-density"],
                0,    "rgba(0,0,0,0)",
                0.08, `rgba(${r},${g},${b},0.03)`,
                0.2,  `rgba(${r},${g},${b},0.08)`,
                0.4,  `rgba(${r},${g},${b},0.15)`,
                0.6,  `rgba(${r},${g},${b},0.22)`,
                0.8,  `rgba(${r},${g},${b},0.30)`,
                1,    `rgba(${r},${g},${b},0.40)`,
              ],
              "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 25, 13, 45, 16, 70],
              "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.8, 14, 0.6, 16, 0.4],
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
