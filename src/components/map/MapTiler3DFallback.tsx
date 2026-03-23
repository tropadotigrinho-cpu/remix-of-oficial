import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { D } from "@/components/ironguard/constants";
import { SP_CENTER, SP_BOUNDS } from "@/lib/mapConstants";
import { getMapTiler3DStyle } from "@/lib/mapFallback";

interface MapTiler3DFallbackProps {
  onExit: () => void;
}

export default function MapTiler3DFallback({ onExit }: MapTiler3DFallbackProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const watchRef = useRef<number | null>(null);
  const [speed, setSpeed] = useState(0);
  const [bearing, setBearing] = useState(0);

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

    const map = new maplibregl.Map({
      container: divRef.current,
      style: getMapTiler3DStyle(),
      center: SP_CENTER,
      zoom: 16,
      pitch: 45,
      bearing: 0,
      maxBounds: SP_BOUNDS,
      antialias: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (navigator.geolocation) {
        watchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, heading, speed: spd } = pos.coords;
            const kmh = spd ? Math.round(spd * 3.6) : 0;
            setSpeed(kmh);

            const newBearing = heading || map.getBearing();
            setBearing(newBearing);

            const zoom = kmh > 60 ? 15 : kmh > 30 ? 15.5 : 16;
            const pitch = kmh > 60 ? 55 : kmh > 30 ? 50 : 45;

            map.easeTo({
              center: [longitude, latitude],
              bearing: newBearing,
              zoom,
              pitch,
              duration: 1000,
            });
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 300, timeout: 5000 }
        );
      }
    });

    map.on("rotate", () => {
      setBearing(map.getBearing());
    });

    return () => {
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>
      <div ref={divRef} style={{ position: "absolute", inset: 0 }} />

      {/* HUD */}
      <div style={{ position: "absolute", top: 16, left: 16, right: 16, zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none" }}>
        {/* Mode badge */}
        <div style={{ padding: "6px 14px", borderRadius: 12, background: "rgba(6,8,14,0.85)", border: `1px solid ${D.border}`, backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: 6, pointerEvents: "auto" }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: D.teal, boxShadow: `0 0 8px ${D.teal}` }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: D.sub, letterSpacing: 1 }}>MODO SIMPLIFICADO</span>
        </div>

        {/* Exit button */}
        <button onClick={() => { cleanup(); onExit(); }} style={{ padding: "8px 16px", borderRadius: 12, background: "rgba(6,8,14,0.9)", border: `1px solid ${D.border}`, color: D.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(12px)", pointerEvents: "auto" }}>
          ← Voltar 2D
        </button>
      </div>

    </div>
  );
}
