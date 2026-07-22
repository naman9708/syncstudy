"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CheckCircle2, Pause, Play, SkipForward, Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLiveElapsed } from "@/hooks/use-live-elapsed";
import { performTaskAction } from "@/lib/firebase/daily-progress";
import { friendlyAuthError } from "@/lib/firebase/errors";
import { formatDuration } from "@/lib/format";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import type { TaskAction } from "@/lib/task-actions";
import type { TaskState } from "@/types";

const PRIORITY_VARIANT = {
  low: "secondary",
  medium: "default",
  high: "warning",
} as const;

const CATEGORY_LABELS: Record<string, string> = {
  study: "Study",
  revision: "Revision",
  practice: "Practice",
  reading: "Reading",
  exercise: "Exercise",
  break: "Break",
  other: "Other",
};

export function TaskTimerRow({
  uid,
  date,
  taskStates,
  task,
}: {
  uid: string;
  date: string;
  taskStates: TaskState[];
  task: TaskState;
}) {
  const [busy, setBusy] = useState(false);
  const liveSeconds = useLiveElapsed(task);
  const isDone = task.status === "completed" || task.status === "skipped";
  const autoCompletedRef = useRef(false);

  const act = useCallback(
    async (action: TaskAction) => {
      setBusy(true);
      try {
        await performTaskAction(uid, date, taskStates, task.taskId, action);
        if (action === "complete") notify("Task completed", task.title);
      } catch (error) {
        toast.error(friendlyAuthError(error));
      } finally {
        setBusy(false);
      }
    },
    [uid, date, taskStates, task.taskId, task.title]
  );

  // Auto-complete when the running elapsed time reaches the configured duration.
  useEffect(() => {
    if (task.status !== "running") {
      // reset the auto-completed flag when not running so future runs can auto-complete again
      autoCompletedRef.current = false;
      return;
    }

    const threshold = (task.durationMinutes ?? 0) * 60;
    if (!autoCompletedRef.current && liveSeconds >= threshold && threshold > 0) {
      autoCompletedRef.current = true;
      // fire-and-forget — act will handle busy state and errors
      void act("complete");
    }
  }, [liveSeconds, task.status, task.durationMinutes, act]);

  return (
    <Card className={cn(task.status === "running" && "border-primary/50 bg-accent/50")}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("truncate text-sm font-medium", isDone && "text-muted-foreground line-through")}>
              {task.title}
            </p>
            <Badge variant={PRIORITY_VARIANT[task.priority]}>{task.priority}</Badge>
            <Badge variant="outline">{CATEGORY_LABELS[task.category]}</Badge>
            {task.status === "skipped" && <Badge variant="destructive">Skipped</Badge>}
          </div>
          {task.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono font-tabular text-sm tabular-nums text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            {formatDuration(liveSeconds)}
            <span className="text-muted-foreground/60">/ {task.durationMinutes}m</span>
          </div>

          <div className="flex gap-1.5">
            {task.status === "not_started" && (
              <Button size="sm" onClick={() => act("start")} disabled={busy}>
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            {task.status === "running" && (
              <Button size="sm" variant="secondary" onClick={() => act("pause")} disabled={busy}>
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            {task.status === "paused" && (
              <Button size="sm" onClick={() => act("start")} disabled={busy}>
                <Play className="h-4 w-4" />
                Resume
              </Button>
            )}
            {!isDone && (
              <>
                <Button size="sm" variant="outline" onClick={() => act("complete")} disabled={busy}>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </Button>
                <Button size="icon" variant="ghost" aria-label="Skip" onClick={() => act("skip")} disabled={busy}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
