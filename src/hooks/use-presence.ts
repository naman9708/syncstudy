"use client";

import { useEffect, useState } from "react";

import { subscribeToPresence } from "@/lib/firebase/presence";
import { PRESENCE_ONLINE_THRESHOLD_MS } from "@/lib/presence-constants";

export function usePresence(uid: string | null) {
  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!uid) return;
    const unsub = subscribeToPresence(uid, setLastSeenAt);
    return () => {
      unsub();
      setLastSeenAt(null);
    };
  }, [uid]);

  // Re-derive "online" every few seconds so a stopped heartbeat flips to offline on its own.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5_000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = lastSeenAt != null && now - lastSeenAt < PRESENCE_ONLINE_THRESHOLD_MS;

  return { isOnline, lastSeenAt };
}
