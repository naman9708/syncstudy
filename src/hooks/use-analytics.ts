"use client";

import { useEffect, useMemo, useState } from "react";

import { dateStringDaysAgo, todayDateString } from "@/lib/date";
import { fetchDailyProgressRange } from "@/lib/firebase/daily-progress";
import { computeStreaks, dailyStatsFromDocs, type DayStat } from "@/lib/analytics";
import { usePartnerConnection } from "@/hooks/use-partner-connection";
import { useAuthStore } from "@/store/useAuthStore";

/** How far back Analytics looks — enough for a full year view plus some room to spare. */
const HISTORY_DAYS = 399;

export function useAnalytics() {
  const user = useAuthStore((s) => s.user);
  const { partnerUid, partnerProfile } = usePartnerConnection();

  const today = todayDateString();
  const start = dateStringDaysAgo(today, HISTORY_DAYS);

  const [selfStats, setSelfStats] = useState<DayStat[]>([]);
  const [partnerStats, setPartnerStats] = useState<DayStat[]>([]);
  const [selfLoading, setSelfLoading] = useState(true);
  const [partnerLoading, setPartnerLoading] = useState(Boolean(partnerUid));

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchDailyProgressRange(user.uid, start, today).then((docs) => {
      if (cancelled) return;
      setSelfStats(dailyStatsFromDocs(docs));
      setSelfLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, start, today]);

  useEffect(() => {
    if (!partnerUid) return;
    let cancelled = false;
    fetchDailyProgressRange(partnerUid, start, today).then((docs) => {
      if (cancelled) return;
      setPartnerStats(dailyStatsFromDocs(docs));
      setPartnerLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [partnerUid, start, today]);

  const streaks = useMemo(() => computeStreaks(selfStats, today), [selfStats, today]);
  const partnerStreaks = useMemo(
    () => (partnerUid ? computeStreaks(partnerStats, today) : null),
    [partnerStats, partnerUid, today]
  );

  return {
    loading: selfLoading,
    partnerLoading,
    selfStats,
    partnerStats,
    partnerProfile,
    hasPartner: Boolean(partnerUid),
    streaks,
    partnerStreaks,
    today,
  };
}
