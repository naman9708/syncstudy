"use client";

import { useEffect, useState } from "react";

import { liveElapsedSeconds } from "@/lib/task-actions";
import type { TaskState } from "@/types";

export function useLiveElapsed(task: TaskState): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (task.status !== "running") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [task.status]);

  return liveElapsedSeconds(task, now);
}
