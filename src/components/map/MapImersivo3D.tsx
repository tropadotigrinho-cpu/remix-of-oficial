import { useEffect, useRef, useState, useCallback } from "react";
import { D } from "@/components/ironguard/constants";
import { SP_CENTER, SP_BOUNDS } from "@/lib/mapConstants";
import { requestMapLoad } from "@/lib/mapboxBudget";
import { getMapTilerKey } from "@/lib/mapFallback";

const MAPBOX_TOKEN = "pk.eyJ1IjoidG9ueW9saXZlaXJhMjAyNiIsImEiOiJjbW1wbWw1dTQwcTQxMnNvbW5lcGJrMTEyIn0.5f-hesUv3crKPnm5Gsp7vw";

interface MapImersivo3DProps {
  onExit: () => void;
}

export default function MapImersivo3D({ onExit }: MapImersivo3DProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const watchRef = useRef<number | null>(null);
  const trailRef = useRef<[number, number][]>([]);
  const userMarkerRef = useRef<any>(null);
  const [speed, setSpeed] = useState(0);
  const [bearing, setBearing] = useState(0);
  const [budgetOk, setBudgetOk] = useState(true);
  const [loading, setLoading] = useState(true);

  const cleanup = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!divRef.current) return;

    if (!requestMapLoad()) {
      setBudgetOk(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const init = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");

      if (cancelled || !divRef.current) return;

      (mapboxgl as any).accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.Map({
        container: divRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: SP_CENTER,
        zoom: 17,
        pitch: 55,
        bearing: 0,
        antialias: true,
        maxBounds: SP_BOUNDS,
      });

      mapRef.current = map;

      map.on("load", () => {
        setLoading(false);

        // ── 3D Buildings ──
        const layers = map.getStyle().layers;
        const labelLayer = layers?.find(
          (l: any) => l.type === "symbol" && l.layout?.["text-field"]
        );

        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 14,
            paint: {
              "fill-extrusion-color": [
                "interpolate", ["linear"], ["get", "height"],
                0, "#0D1829",
                30, "#0F2035",
                80, "#162038",
                150, "#1C2E4A",
                250, "#23385C",
              ],
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 1.0,
            },
          },
          labelLayer?.id
        );

        // ── Terrain (MapTiler DEM) ──
        const key = getMapTilerKey();
        map.addSource("maptiler-terrain", {
          type: "raster-dem",
          url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${key}`,
          tileSize: 256,
        });
        map.setTerrain({ source: "maptiler-terrain", exaggeration: 1.3 });

        // ── Fog ──
        map.setFog({
          color: "#0D1829",
          "high-color": "#162038",
          "horizon-blend": 0.05,
          "space-color": "#080A0F",
          "star-intensity": 0.12,
        } as any);

        // ── User trail source ──
        map.addSource("user-trail", {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} },
        });

        map.addLayer({
          id: "user-trail-line",
          type: "line",
          source: "user-trail",
          paint: {
            "line-color": "#3D8EFF",
            "line-width": 3,
            "line-opacity": 0.5,
            "line-blur": 2,
          },
        });

        // ── GPS Cockpit ──
        if (navigator.geolocation) {
          // Create user marker
          const el = document.createElement("div");
          el.innerHTML = `
            <div style="position:relative;width:32px;height:32px;">
              <div style="position:absolute;inset:0;border-radius:50%;background:rgba(61,142,255,0.2);animation:ig3d-pulse 2s ease-out infinite;"></div>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#3D8EFF;border:3px solid #fff;box-shadow:0 0 12px rgba(61,142,255,0.8);"></div>
              <div style="position:absolute;top:-4px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #3D8EFF;"></div>
            </div>
          `;
          const marker = new mapboxgl.Marker({ element: el, pitchAlignment: "map", rotationAlignment: "map" })
            .setLngLat(SP_CENTER)
            .addTo(map);
          userMarkerRef.current = marker;

          watchRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              const { latitude, longitude, heading, speed: spd } = pos.coords;
              const kmh = spd ? Math.round(spd * 3.6) : 0;
              setSpeed(kmh);

              const newBearing = heading || map.getBearing();
              setBearing(newBearing);

              // Dynamic zoom/pitch based on speed
              const zoom = spd
                ? Math.max(14.5, Math.min(17, 17 - (spd / 20)))
                : 17;
              const pitch = spd
                ? Math.min(65, 55 + (spd / 20))
                : 55;

              map.easeTo({
                center: [longitude, latitude],
                bearing: newBearing,
                zoom,
                pitch,
                duration: 300,
                easing: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
              });

              // Update user marker
              userMarkerRef.current?.setLngLat([longitude, latitude]);
              if (heading) {
                userMarkerRef.current?.setRotation(heading);
              }

              // Trail
              const trail = trailRef.current;
              trail.push([longitude, latitude]);
              if (trail.length > 30) trail.shift();

              try {
                const src = map.getSource("user-trail") as any;
                src?.setData({
                  type: "Feature",
                  geometry: { type: "LineString", coordinates: trail },
                  properties: {},
                });
              } catch { /* ignore */ }
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 300, timeout: 5000 }
          );
        }
      });

      map.on("rotate", () => {
        setBearing(map.getBearing());
      });
    };

    init();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!budgetOk) {
    return <BudgetExhausted onExit={onExit} />;
  }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
      <div ref={divRef} style={{ position: "absolute", inset: 0 }} />

      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(6,8,14,0.95)", zIndex: 20, color: D.sub, fontSize: 13 }}>
          Inicializando modo 3D...
        </div>
      )}

      {/* HUD */}
      <div style={{ position: "absolute", top: 16, left: 16, right: 16, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none" }}>
        {/* Mode badge */}
        <div style={{ padding: "6px 14px", borderRadius: 12, background: `${D.blue}22`, border: `1px solid ${D.blue}44`, backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto" }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: D.blue, boxShadow: `0 0 8px ${D.blue}`, animation: "ig3d-pulse 2s ease-out infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: D.blue, letterSpacing: 1 }}>MODO 3D</span>
        </div>

        {/* Exit button */}
        <button onClick={() => { cleanup(); onExit(); }} style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(6,8,14,0.9)", border: `1px solid ${D.border}`, color: D.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(12px)", pointerEvents: "auto", transition: "all 0.2s" }}>
          ← Voltar 2D
        </button>
      </div>

      {/* Speed + Compass HUD */}
      <div style={{ position: "absolute", bottom: 100, left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", gap: 12, pointerEvents: "none" }}>
        <div style={{ padding: "8px 18px", borderRadius: 14, background: "rgba(6,8,14,0.9)", border: `1px solid ${D.border}`, backdropFilter: "blur(12px)", textAlign: "center", minWidth: 64 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: D.text, fontVariantNumeric: "tabular-nums" }}>{speed}</div>
          <div style={{ fontSize: 9, color: D.sub, fontWeight: 600, letterSpacing: 1 }}>km/h</div>
        </div>
        <div style={{ padding: "8px 14px", borderRadius: 14, background: "rgba(6,8,14,0.9)", border: `1px solid ${D.border}`, backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="28" height="28" viewBox="0 0 20 20" style={{ transform: `rotate(${-bearing}deg)`, transition: "transform 0.3s" }}>
            <path d="M10 2L13 10L10 8L7 10L10 2Z" fill="#FF3232" />
            <path d="M10 18L7 10L10 12L13 10L10 18Z" fill="rgba(238,242,250,0.3)" />
          </svg>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes ig3d-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function BudgetExhausted({ onExit }: { onExit: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "rgba(6,8,14,0.95)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>🗺</div>
      <div style={{ color: D.sub, fontSize: 14, textAlign: "center", maxWidth: 260 }}>
        Limite mensal do modo 3D atingido. Volte no próximo mês.
      </div>
      <button onClick={onExit} style={{ padding: "10px 24px", borderRadius: 14, background: D.s2, border: `1px solid ${D.border}`, color: D.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
        Voltar ao mapa 2D
      </button>
    </div>
  );
}
