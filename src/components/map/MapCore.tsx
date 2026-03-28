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

const MapCore = memo(
  forwardRef<MapCoreHandle, MapCoreProps>(
    ({ visible, onReady, onPinClick, onMapMove, userPlan, alertsGeoJSON, userCoords }, ref) => {
      const divRef = useRef<HTMLDivElement>(null);
      const mapRef = useRef<maplibregl.Map | null>(null);
      const readyRef = useRef(false);
      const moveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
      const userMarkerRef = useRef<maplibregl.Marker | null>(null);

      useImperativeHandle(ref, () => ({
        getMap: () => mapRef.current,
        flyTo: (center, zoom) => {
          mapRef.current?.flyTo({ center, zoom: zoom || ZOOM_DEFAULT, duration: 800 });
        },
        setHeatmapVisible: (vis) => {
          if (!mapRef.current) return;
          try {
            mapRef.current.setLayoutProperty(
              "alerts-heatmap",
              "visibility",
              vis ? "visible" : "none"
            );
          } catch {
            // layer may not exist yet
          }
        },
      }));

      // Initialize map ONCE
      useEffect(() => {
        if (!divRef.current || mapRef.current) return;

        registerPMTilesProtocol();

        const initMap = async () => {
          let style: string | maplibregl.StyleSpecification;

          // Try cached/Supabase style first, fallback to MapTiler
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

            // ── LAYER 1: Heatmap ──
            map.addSource("alerts-heat", {
              type: "geojson",
              data: alertsGeoJSON || { type: "FeatureCollection", features: [] },
            });

            map.addLayer({
              id: "alerts-heatmap",
              type: "heatmap",
              source: "alerts-heat",
              maxzoom: 14,
              paint: {
                "heatmap-weight": [
                  "interpolate",
                  ["linear"],
                  ["get", "votes"],
                  0, 0,
                  12, 1,
                ],
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  11, 0.6,
                  14, 1.2,
                ],
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0, "rgba(0,0,0,0)",
                  0.2, "rgba(255,100,0,0.3)",
                  0.4, "rgba(255,80,0,0.5)",
                  0.6, "rgba(255,50,0,0.65)",
                  0.8, "rgba(255,30,0,0.8)",
                  1, "rgba(255,0,0,0.9)",
                ],
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  11, 20,
                  14, 40,
                ],
                "heatmap-opacity": 0.7,
              },
            });

            // ── LAYER 2: User radius circle ──
            const radiusM = userPlan === "pro" ? RAIO_PRO_M : RAIO_FREE_M;
            const center = userCoords || SP_CENTER;
            const circle = turf.circle(center, radiusM / 1000, {
              steps: 64,
              units: "kilometers",
            });

            map.addSource("user-radius", {
              type: "geojson",
              data: circle,
            });

            map.addLayer({
              id: "user-radius-fill",
              type: "fill",
              source: "user-radius",
              paint: {
                "fill-color": "#3D8EFF",
                "fill-opacity": 0.05,
              },
            });

            map.addLayer({
              id: "user-radius-stroke",
              type: "line",
              source: "user-radius",
              paint: {
                "line-color": "#3D8EFF",
                "line-width": 1.5,
                "line-opacity": 0.3,
                "line-dasharray": [3, 2],
              },
            });

            // ── LAYER 3: Zonas de risco (mock — circular) ──
            const zonasRisco: GeoJSON.FeatureCollection = {
              type: "FeatureCollection",
              features: [
                turf.circle([-46.655, -23.550], 0.6, { steps: 48, units: "kilometers", properties: { nivel: 4, nome: "Consolação" } }),
                turf.circle([-46.640, -23.555], 0.5, { steps: 48, units: "kilometers", properties: { nivel: 3, nome: "Bela Vista" } }),
                turf.circle([-46.635, -23.525], 0.7, { steps: 48, units: "kilometers", properties: { nivel: 2, nome: "Bom Retiro" } }),
                turf.circle([-46.620, -23.545], 0.4, { steps: 48, units: "kilometers", properties: { nivel: 5, nome: "Liberdade" } }),
                turf.circle([-46.665, -23.535], 0.55, { steps: 48, units: "kilometers", properties: { nivel: 1, nome: "Higienópolis" } }),
              ],
            };

            map.addSource("zonas-risco", {
              type: "geojson",
              data: zonasRisco,
            });

            map.addLayer({
              id: "zonas-risco-fill",
              type: "fill",
              source: "zonas-risco",
              paint: {
                "fill-color": [
                  "match",
                  ["get", "nivel"],
                  1, "#FFD000",
                  2, "#FF7A00",
                  3, "#FF3232",
                  4, "#9D6FFF",
                  5, "#8B0000",
                  "#FF3232",
                ],
                "fill-opacity": 0.15,
              },
            });


            // ── LAYER 4: Alert pins (clustered) ──
            map.addSource("alert-pins", {
              type: "geojson",
              data: alertsGeoJSON || { type: "FeatureCollection", features: [] },
              cluster: true,
              clusterMaxZoom: 13,
              clusterRadius: 50,
            });

            // Cluster circles
            map.addLayer({
              id: "alert-clusters",
              type: "circle",
              source: "alert-pins",
              filter: ["has", "point_count"],
              paint: {
                "circle-color": [
                  "step",
                  ["get", "point_count"],
                  "#FF7A00",
                  5, "#FF3232",
                  10, "#FF2D78",
                ],
                "circle-radius": [
                  "step",
                  ["get", "point_count"],
                  18,
                  5, 24,
                  10, 30,
                ],
                "circle-opacity": 0.85,
                "circle-stroke-width": 0,
              },
            });

            // Cluster count labels
            map.addLayer({
              id: "alert-cluster-count",
              type: "symbol",
              source: "alert-pins",
              filter: ["has", "point_count"],
              layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-size": 12,
              },
              paint: {
                "text-color": "#ffffff",
              },
            });

            // ── Gradient halos for serious alerts (roubo/assalto) ──
            map.addSource("alert-pins-serious", {
              type: "geojson",
              data: { type: "FeatureCollection", features: [] },
            });

            map.addLayer({
              id: "alert-serious-halo",
              type: "circle",
              source: "alert-pins-serious",
              paint: {
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  11, 30, 14, 60, 17, 90,
                ],
                "circle-color": ["get", "color"],
                "circle-opacity": 0.18,
                "circle-blur": 1,
              },
            });

            // Individual pins — dark bg circle
            map.addLayer({
              id: "alert-unclustered",
              type: "circle",
              source: "alert-pins",
              filter: ["!", ["has", "point_count"]],
              paint: {
                "circle-radius": 12,
                "circle-color": "rgba(6,8,14,0.85)",
                "circle-stroke-width": 0,
                "circle-opacity": 0.9,
              },
            });

            // Pin emoji icons
            map.addLayer({
              id: "alert-unclustered-icon",
              type: "symbol",
              source: "alert-pins",
              filter: ["!", ["has", "point_count"]],
              layout: {
                "text-field": ["get", "icon"],
                "text-size": 14,
                "text-allow-overlap": true,
              },
            });

            // ── LAYER 5: User location marker ──
            // Will be updated via userCoords prop changes

            // ── Events ──
            // Click cluster → zoom in
            map.on("click", "alert-clusters", (e) => {
              const features = map.queryRenderedFeatures(e.point, {
                layers: ["alert-clusters"],
              });
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

            // Click pin → emit
            map.on("click", "alert-unclustered", (e) => {
              if (!e.features?.length) return;
              const props = e.features[0].properties;
              onPinClick?.(props as Record<string, unknown>);
            });

            // Cursor changes
            map.on("mouseenter", "alert-unclustered", () => {
              map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "alert-unclustered", () => {
              map.getCanvas().style.cursor = "";
            });
            map.on("mouseenter", "alert-clusters", () => {
              map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", "alert-clusters", () => {
              map.getCanvas().style.cursor = "";
            });

            onReady?.();
          });

          // Debounced moveend
          map.on("moveend", () => {
            clearTimeout(moveTimeoutRef.current);
            moveTimeoutRef.current = setTimeout(() => {
              if (mapRef.current) {
                onMapMove?.(mapRef.current.getBounds());
              }
            }, 400);
          });
        };

        initMap();

        return () => {
          // Do NOT remove MapCore — it stays alive for the session
          clearTimeout(moveTimeoutRef.current);
        };
      }, []); // eslint-disable-line react-hooks/exhaustive-deps

      // Update alerts GeoJSON
      useEffect(() => {
        if (!mapRef.current || !readyRef.current || !alertsGeoJSON) return;

        try {
          const heatSource = mapRef.current.getSource("alerts-heat") as maplibregl.GeoJSONSource;
          heatSource?.setData(alertsGeoJSON);

          const pinSource = mapRef.current.getSource("alert-pins") as maplibregl.GeoJSONSource;
          pinSource?.setData(alertsGeoJSON);

          // Feed serious alerts source (roubo/assalto only)
          const seriousFeatures = alertsGeoJSON.features.filter((f) => {
            const t = (f.properties as any)?.type;
            return t === "roubo" || t === "assalto";
          });
          const seriousSource = mapRef.current.getSource("alert-pins-serious") as maplibregl.GeoJSONSource;
          seriousSource?.setData({ type: "FeatureCollection", features: seriousFeatures });
        } catch {
          // sources may not exist yet
        }
      }, [alertsGeoJSON]);

      // Update user location marker
      useEffect(() => {
        if (!mapRef.current || !readyRef.current || !userCoords) return;

        if (!userMarkerRef.current) {
          const el = document.createElement("div");
          el.className = "ig-user-marker";
          el.innerHTML = `
            <div class="ig-user-pulse"></div>
            <div class="ig-user-dot"></div>
          `;
          userMarkerRef.current = new maplibregl.Marker({ element: el })
            .setLngLat(userCoords)
            .addTo(mapRef.current);
        } else {
          userMarkerRef.current.setLngLat(userCoords);
        }

        // Update radius circle
        try {
          const radiusM = userPlan === "pro" ? RAIO_PRO_M : RAIO_FREE_M;
          const circle = turf.circle(userCoords, radiusM / 1000, {
            steps: 64,
            units: "kilometers",
          });
          const source = mapRef.current.getSource("user-radius") as maplibregl.GeoJSONSource;
          source?.setData(circle);
        } catch {
          // ignore
        }
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
