"use client";

import { useEffect, useState } from "react";

import { currentDayTemplate, todayDateString } from "@/lib/date";
import { ensureDailyProgress, subscribeToDailyProgress } from "@/lib/firebase/daily-progress";
import { useAuthStore } from "@/store/useAuthStore";
import { useRoutines } from "@/hooks/use-routines";
import type { DailyProgress } from "@/types";

export function useTodaysChecklist() {
  const user = useAuthStore((s) => s.user);
  const { routines, loading: routinesLoading } = useRoutines();
  const [date, setDate] = useState(() => todayDateString());
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Check once a minute whether the local date has rolled over (e.g. a tab left open past midnight).
  useEffect(() => {
    const interval = setInterval(() => {
      const next = todayDateString();
      setDate((current) => (current === next ? current : next));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || routinesLoading) return;

    let cancelled = false;
    const template = currentDayTemplate();
    const tasksForToday = routines[template];

    ensureDailyProgress(user.uid, date, template, tasksForToday);

    const unsub = subscribeToDailyProgress(user.uid, date, (p) => {
      if (cancelled) return;
      setProgress(p);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, date, routinesLoading]);

  return { progress, loading: loading || routinesLoading, date, template: currentDayTemplate() };
}
