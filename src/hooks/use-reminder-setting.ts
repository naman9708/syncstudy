"use client";

import { useState } from "react";

import { getLocalBoolean, setLocalBoolean } from "@/lib/local-preferences";
import { requestNotificationPermission } from "@/lib/notifications";

const KEY = "remindersEnabled";

export function useReminderSetting() {
  // Settings only ever renders inside the authenticated dashboard shell, which
  // itself gates on client-side auth state before mounting — so there's no
  // meaningful pre-hydration HTML for a localStorage-derived mismatch to affect.
  const [enabled, setEnabledState] = useState(() => getLocalBoolean(KEY, false));

  function setEnabled(value: boolean) {
    setEnabledState(value);
    setLocalBoolean(KEY, value);
    if (value) requestNotificationPermission();
  }

  return { enabled, setEnabled };
}
