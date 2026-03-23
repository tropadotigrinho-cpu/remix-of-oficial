/**
 * Controls Mapbox Map Load consumption.
 * Each 3D mode session = 1 Map Load.
 * Monthly limit configurable (default: 45,000 — safety margin from 50k free tier).
 */

const STORAGE_KEY = "ig_mapbox_budget";
const MONTHLY_LIMIT = 45000;

interface BudgetData {
  month: string; // 'YYYY-MM'
  loads: number;
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getBudget(): BudgetData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: BudgetData = JSON.parse(raw);
      if (data.month === getCurrentMonth()) return data;
    }
  } catch {
    // ignore
  }
  return { month: getCurrentMonth(), loads: 0 };
}

export function incrementLoad(): void {
  const b = getBudget();
  b.loads += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

export function canUseMapbox(): boolean {
  return getBudget().loads < MONTHLY_LIMIT;
}

export function getRemainingLoads(): number {
  return Math.max(0, MONTHLY_LIMIT - getBudget().loads);
}

/**
 * Call BEFORE initializing Mapbox 3D mode.
 * Returns false if budget exhausted → use MapTiler fallback.
 */
export function requestMapLoad(): boolean {
  if (!canUseMapbox()) return false;
  incrementLoad();
  return true;
}
