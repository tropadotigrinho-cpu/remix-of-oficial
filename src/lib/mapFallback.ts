/**
 * MapTiler fallback style for when Supabase/PMTiles style is unavailable.
 */

const MAPTILER_KEY = "INuEPNi1UEi0PlscwHhk";

export function getMapTilerStyle(): string {
  return `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`;
}

export function getMapTiler3DStyle(): string {
  return `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`;
}

export function getMapTilerKey(): string {
  return MAPTILER_KEY;
}
