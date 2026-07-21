"use client";

import { useEffect, useState } from "react";

import { todayDateString } from "@/lib/date";
import { subscribeToDailyProgress } from "@/lib/firebase/daily-progress";
import type { DailyProgress } from "@/types";

export function usePartnerDailyProgress(partnerUid: string | null) {
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(Boolean(partnerUid));
  const date = todayDateString();

  useEffect(() => {
    if (!partnerUid) return;
    const unsub = subscribeToDailyProgress(partnerUid, date, (p) => {
      setProgress(p);
      setLoading(false);
    });
    return () => {
      unsub();
      setProgress(null);
      setLoading(false);
    };
  }, [partnerUid, date]);

  return { progress, loading, date };
}
