import { useState } from "react";

/**
 * Returns user plan. Currently returns 'free' as default.
 * When Supabase profiles table is ready, this will read from profiles.plano.
 */
export function useUserPlan(): "free" | "pro" {
  const [plan] = useState<"free" | "pro">("free");
  // TODO: Read from Supabase profiles.plano with 5-min cache
  return plan;
}
