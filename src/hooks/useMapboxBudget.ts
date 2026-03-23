import { canUseMapbox, getRemainingLoads, getBudget } from "@/lib/mapboxBudget";

export function useMapboxBudget() {
  const budget = getBudget();

  return {
    canUse3D: canUseMapbox(),
    remainingLoads: getRemainingLoads(),
    monthlyUsage: budget.loads,
    monthlyLimit: 45000,
  };
}
