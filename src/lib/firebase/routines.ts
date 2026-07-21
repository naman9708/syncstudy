import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { DayTemplate, RoutineTask, RoutineTemplates } from "@/types";

function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function fromDoc(data: Record<string, unknown> | undefined): RoutineTemplates {
  return {
    weekday: (data?.weekday as RoutineTask[]) ?? [],
    weekend: (data?.weekend as RoutineTask[]) ?? [],
    updatedAt: toMillis(data?.updatedAt),
  };
}

export function subscribeToRoutines(uid: string, callback: (routines: RoutineTemplates) => void) {
  return onSnapshot(doc(db, "routines", uid), (snap) => {
    callback(fromDoc(snap.data()));
  });
}

export async function getRoutinesOnce(uid: string): Promise<RoutineTemplates> {
  const snap = await getDoc(doc(db, "routines", uid));
  return fromDoc(snap.data());
}

export async function saveRoutineTasks(uid: string, day: DayTemplate, tasks: RoutineTask[]) {
  await setDoc(
    doc(db, "routines", uid),
    { [day]: tasks, updatedAt: serverTimestamp() },
    { merge: true }
  );
}
