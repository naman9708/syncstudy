import type { TaskState } from "@/types";

export type TaskAction = "start" | "pause" | "complete" | "skip";

function elapsedFor(t: TaskState, now: number): number {
  if (t.status === "running" && t.runningSince != null) {
    return t.elapsedSeconds + Math.floor((now - t.runningSince) / 1000);
  }
  return t.elapsedSeconds;
}

/**
 * Applies a timer action to one task, auto-pausing any other task that's
 * currently running — only one task can run at a time for a given user.
 */
export function applyTaskAction(taskStates: TaskState[], taskId: string, action: TaskAction, now = Date.now()): TaskState[] {
  return taskStates.map((t) => {
    if (t.taskId !== taskId) {
      if (action === "start" && t.status === "running") {
        return { ...t, status: "paused", elapsedSeconds: elapsedFor(t, now), runningSince: null };
      }
      return t;
    }

    switch (action) {
      case "start":
        return { ...t, status: "running", runningSince: now };
      case "pause":
        return { ...t, status: "paused", elapsedSeconds: elapsedFor(t, now), runningSince: null };
      case "complete":
        return {
          ...t,
          status: "completed",
          elapsedSeconds: elapsedFor(t, now),
          runningSince: null,
          completedAt: now,
        };
      case "skip":
        return { ...t, status: "skipped", elapsedSeconds: elapsedFor(t, now), runningSince: null };
      default:
        return t;
    }
  });
}

/** Live elapsed seconds for display — ticks forward from `runningSince` so a refresh never loses time. */
export function liveElapsedSeconds(t: TaskState, now = Date.now()): number {
  return elapsedFor(t, now);
}
