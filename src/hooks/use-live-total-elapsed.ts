"use client";

import { useEffect, useState } from "react";

import { liveElapsedSeconds } from "@/lib/task-actions";
import type { TaskState } from "@/types";

export function useLiveTotalElapsed(taskStates: TaskState[]): number {
  const [now, setNow] = useState(() => Date.now());
  const hasRunning = taskStates.some((t) => t.status === "running");

  useEffect(() => {
    if (!hasRunning) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasRunning]);

  return taskStates.reduce((sum, t) => sum + liveElapsedSeconds(t, now), 0);
}
