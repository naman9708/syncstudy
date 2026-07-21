"use client";

import { useEffect } from "react";

import { writeHeartbeat } from "@/lib/firebase/presence";
import { HEARTBEAT_INTERVAL_MS } from "@/lib/presence-constants";
import { useAuthStore } from "@/store/useAuthStore";

export function usePresenceHeartbeat() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const beat = () => {
      if (document.visibilityState === "visible") {
        writeHeartbeat(user.uid);
      }
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", beat);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [user]);
}
