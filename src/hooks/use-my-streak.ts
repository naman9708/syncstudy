"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useStreakFor } from "@/hooks/use-streak-for";

/** Thin wrapper around useStreakFor for the signed-in user (used on the Dashboard). */
export function useMyStreak() {
  const user = useAuthStore((s) => s.user);
  return useStreakFor(user?.uid ?? null);
}
