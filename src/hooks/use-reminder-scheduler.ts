"use client";

import { useEffect } from "react";

import { todayDateString } from "@/lib/date";
import { getLocalString, setLocalString } from "@/lib/local-preferences";
import { notify } from "@/lib/notifications";
import { useReminderSetting } from "@/hooks/use-reminder-setting";
import { useTodaysChecklist } from "@/hooks/use-todays-checklist";

/** 24h local hour after which an incomplete checklist triggers a reminder. */
const REMINDER_HOUR = 20;
const CHECK_INTERVAL_MS = 60_000;
const LAST_REMINDED_KEY = "lastReminderDate";

export function useReminderScheduler() {
  const { enabled } = useReminderSetting();
  const { progress } = useTodaysChecklist();

  useEffect(() => {
    if (!enabled) return;

    function maybeRemind() {
      const now = new Date();
      const today = todayDateString(now);
      if (now.getHours() < REMINDER_HOUR) return;
      if (getLocalString(LAST_REMINDED_KEY) === today) return;

      const tasks = progress?.taskStates ?? [];
      const allDone = tasks.length > 0 && tasks.every((t) => t.status === "completed");
      if (allDone) return;

      notify("Your SyncStudy routine is waiting", "You haven't finished today's checklist yet.");
      setLocalString(LAST_REMINDED_KEY, today);
    }

    maybeRemind();
    const interval = setInterval(maybeRemind, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [enabled, progress]);
}
