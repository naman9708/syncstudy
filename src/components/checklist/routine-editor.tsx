"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskFormDialog, CATEGORY_LABELS, PRIORITY_LABELS } from "@/components/checklist/task-form-dialog";
import { saveRoutineTasks } from "@/lib/firebase/routines";
import { friendlyAuthError } from "@/lib/firebase/errors";
import type { TaskFormInput } from "@/lib/validations/task";
import type { DayTemplate, RoutineTask } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";

const PRIORITY_VARIANT = {
  low: "secondary",
  medium: "default",
  high: "warning",
} as const;

export function RoutineEditor({ day, tasks }: { day: DayTemplate; tasks: RoutineTask[] }) {
  const user = useAuthStore((s) => s.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RoutineTask | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = [...tasks].sort((a, b) => a.order - b.order);

  async function persist(next: RoutineTask[]) {
    if (!user) return;
    await saveRoutineTasks(user.uid, day, next);
  }

  async function handleSubmit(values: TaskFormInput) {
    if (!user) return;
    setSaving(true);
    try {
      let next: RoutineTask[];
      if (editingTask) {
        next = sorted.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: values.title,
                description: values.description ?? "",
                durationMinutes: values.durationMinutes,
                category: values.category as RoutineTask["category"],
                priority: values.priority as RoutineTask["priority"],
              }
            : t
        );
      } else {
        const newTask: RoutineTask = {
          id: crypto.randomUUID(),
          title: values.title,
          description: values.description ?? "",
          durationMinutes: values.durationMinutes,
          category: values.category as RoutineTask["category"],
          priority: values.priority as RoutineTask["priority"],
          order: sorted.length,
        };
        next = [...sorted, newTask];
      }
      await persist(next);
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(taskId: string) {
    const next = sorted.filter((t) => t.id !== taskId).map((t, i) => ({ ...t, order: i }));
    try {
      await persist(next);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    }
  }

  async function handleMove(taskId: string, direction: -1 | 1) {
    const index = sorted.findIndex((t) => t.id === taskId);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    const reordered = next.map((t, i) => ({ ...t, order: i }));
    try {
      await persist(reordered);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sorted.length} task{sorted.length === 1 ? "" : "s"}
        </p>
        <Button
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          No tasks yet — add your first one above.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((task, i) => (
            <Card key={task.id}>
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <Badge variant={PRIORITY_VARIANT[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                    <Badge variant="outline">{CATEGORY_LABELS[task.category]}</Badge>
                  </div>
                  {task.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.description}</p>
                  )}
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.durationMinutes} min
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => handleMove(task.id, -1)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Move down"
                    disabled={i === sorted.length - 1}
                    onClick={() => handleMove(task.id, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit"
                    onClick={() => {
                      setEditingTask(task);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Delete"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditingTask(null);
        }}
        initialTask={editingTask}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
