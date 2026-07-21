"use client";

import { useEffect, useState } from "react";

import { subscribeToRoutines } from "@/lib/firebase/routines";
import { useAuthStore } from "@/store/useAuthStore";
import type { RoutineTemplates } from "@/types";

const EMPTY: RoutineTemplates = { weekday: [], weekend: [], updatedAt: 0 };

export function useRoutines() {
  const user = useAuthStore((s) => s.user);
  const [routines, setRoutines] = useState<RoutineTemplates>(EMPTY);
  const [loading, setLoading] = useState(Boolean(user));

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToRoutines(user.uid, (r) => {
      setRoutines(r);
      setLoading(false);
    });
    return () => {
      unsub();
      setRoutines(EMPTY);
      setLoading(false);
    };
  }, [user]);

  return { routines, loading };
}
