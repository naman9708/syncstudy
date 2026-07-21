import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { applyTaskAction, type TaskAction } from "@/lib/task-actions";
import type { DailyProgress, DayTemplate, RoutineTask, TaskState } from "@/types";

const COLLECTION = "dailyProgress";

export function dailyProgressId(uid: string, date: string) {
  return `${uid}_${date}`;
}

function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function fromDoc(data: Record<string, unknown>): DailyProgress {
  return {
    uid: data.uid as string,
    date: data.date as string,
    template: data.template as DayTemplate,
    taskStates: (data.taskStates as TaskState[]) ?? [],
    updatedAt: toMillis(data.updatedAt),
  };
}

export function subscribeToDailyProgress(
  uid: string,
  date: string,
  callback: (progress: DailyProgress | null) => void
) {
  return onSnapshot(doc(db, COLLECTION, dailyProgressId(uid, date)), (snap) => {
    callback(snap.exists() ? fromDoc(snap.data()) : null);
  });
}

function taskToState(task: RoutineTask): TaskState {
  return {
    taskId: task.id,
    title: task.title,
    description: task.description,
    durationMinutes: task.durationMinutes,
    category: task.category,
    priority: task.priority,
    status: "not_started",
    elapsedSeconds: 0,
    runningSince: null,
    completedAt: null,
  };
}

/**
 * Creates today's checklist the first time it's opened, snapshotting the
 * current routine template so later edits to the template don't retroactively
 * change a day already in progress. If the day's doc already exists, only
 * tasks that are brand new to the template are appended — existing entries
 * (and any in-progress timer state) are left untouched.
 */
export async function ensureDailyProgress(
  uid: string,
  date: string,
  template: DayTemplate,
  routineTasks: RoutineTask[]
): Promise<void> {
  const ref = doc(db, COLLECTION, dailyProgressId(uid, date));
  const existing = await getDoc(ref);
  const ordered = [...routineTasks].sort((a, b) => a.order - b.order);

  if (!existing.exists()) {
    await setDoc(ref, {
      uid,
      date,
      template,
      taskStates: ordered.map(taskToState),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const currentStates = (existing.data().taskStates as TaskState[]) ?? [];
  const existingIds = new Set(currentStates.map((t) => t.taskId));
  const newOnes = ordered.filter((t) => !existingIds.has(t.id)).map(taskToState);
  if (newOnes.length === 0) return;

  await updateDoc(ref, {
    taskStates: [...currentStates, ...newOnes],
    updatedAt: serverTimestamp(),
  });
}

export async function performTaskAction(
  uid: string,
  date: string,
  taskStates: TaskState[],
  taskId: string,
  action: TaskAction
) {
  const updated = applyTaskAction(taskStates, taskId, action);
  await updateDoc(doc(db, COLLECTION, dailyProgressId(uid, date)), {
    taskStates: updated,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Fetches every dailyProgress doc for one user between two dates (inclusive).
 * Ranges on the document id itself (`${uid}_${date}`) rather than a uid + date
 * where-clause, so it needs no composite index — just the id's natural sort.
 */
export async function fetchDailyProgressRange(
  uid: string,
  startDate: string,
  endDate: string
): Promise<DailyProgress[]> {
  const q = query(
    collection(db, COLLECTION),
    where(documentId(), ">=", dailyProgressId(uid, startDate)),
    where(documentId(), "<=", dailyProgressId(uid, endDate))
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromDoc(d.data())).sort((a, b) => a.date.localeCompare(b.date));
}
