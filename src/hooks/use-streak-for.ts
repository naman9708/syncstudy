"use client";

import { useEffect, useState } from "react";

import { dateStringDaysAgo, todayDateString } from "@/lib/date";
import { fetchDailyProgressRange } from "@/lib/firebase/daily-progress";
import { computeStreaks, dailyStatsFromDocs } from "@/lib/analytics";

const WINDOW_DAYS = 90;

export function useStreakFor(uid: string | null) {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(Boolean(uid));

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const today = todayDateString();
    const start = dateStringDaysAgo(today, WINDOW_DAYS);
    fetchDailyProgressRange(uid, start, today).then((docs) => {
      if (cancelled) return;
      const stats = dailyStatsFromDocs(docs);
      setCurrent(computeStreaks(stats, today).current);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return { current, loading };
}
