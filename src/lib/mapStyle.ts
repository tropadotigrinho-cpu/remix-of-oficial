import { supabase } from "@/integrations/supabase/client";

const KEY = "ig_style_v2";
const TTL = 5 * 24 * 60 * 60 * 1000; // 5 days

let ram: string | null = null;

/**
 * 3-layer cache for map style JSON:
 * L1: RAM (0ms) → L2: localStorage (10ms) → L3: Supabase Storage (~300ms)
 * Falls back to MapTiler if all fail.
 */
export async function getMapStyle(): Promise<object> {
  // L1 — RAM
  if (ram) return JSON.parse(ram);

  // L2 — localStorage
  try {
    const s = localStorage.getItem(KEY);
    if (s) {
      const { data, ts } = JSON.parse(s);
      if (Date.now() - ts < TTL) {
        ram = data;
        return JSON.parse(data);
      }
    }
  } catch {
    // ignore localStorage errors
  }

  // L3 — Supabase Storage
  try {
    const { data: blob, error } = await supabase.storage
      .from("maps")
      .download("dark-premium.json");

    if (!error && blob) {
      const str = await blob.text();
      ram = str;
      localStorage.setItem(KEY, JSON.stringify({ data: str, ts: Date.now() }));
      return JSON.parse(str);
    }
  } catch {
    // fall through to fallback
  }

  // Fallback — return null to trigger MapTiler fallback
  return null as unknown as object;
}

/**
 * Replace Mapbox sources with PMTiles local source
 */
export function injectPMTilesSource(style: Record<string, unknown>): Record<string, unknown> {
  const s = structuredClone(style);
  const sources = s.sources as Record<string, unknown> | undefined;

  if (sources?.composite) {
    sources.composite = {
      type: "vector",
      url: "pmtiles://" + (import.meta.env.VITE_PMTILES_URL || ""),
    };
  }

  const k = "INuEPNi1UEi0PlscwHhk";
  (s as Record<string, unknown>).glyphs = `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${k}`;
  (s as Record<string, unknown>).sprite = `https://api.maptiler.com/maps/dataviz-dark/sprite?key=${k}`;

  return s;
}

export function clearStyleCache() {
  ram = null;
  localStorage.removeItem(KEY);
}
