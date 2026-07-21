"use client";

import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskTimerRow } from "@/components/checklist/task-timer-row";
import { useTodaysChecklist } from "@/hooks/use-todays-checklist";
import { useAuthStore } from "@/store/useAuthStore";

export function TodaysChecklist() {
  const user = useAuthStore((s) => s.user);
  const { progress, loading, date, template } = useTodaysChecklist();

  if (loading || !user) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const tasks = progress?.taskStates ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{template}</span>
          </div>
          <p className="font-mono font-tabular text-sm font-medium">
            {completed}/{total} done
          </p>
        </CardContent>
      </Card>

      {total === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Your {template} routine is empty. Add tasks in the &quot;{template === "weekday" ? "Weekday" : "Weekend"}
          &quot; tab to see them here.
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskTimerRow key={task.taskId} uid={user.uid} date={date} taskStates={tasks} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
