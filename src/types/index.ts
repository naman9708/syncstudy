export type ThemePreference = "light" | "dark" | "system";

/** Firestore document at users/{uid} */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  semester: string;
  partnerId: string | null;
  /** When true, your partner's live view shows a generic status instead of your specific task title/description. */
  privacyMode: boolean;
  createdAt: number;
}

export type ConnectionStatus = "pending" | "accepted" | "rejected" | "removed";

/**
 * Firestore document at connections/{connectionId}.
 * `participants` (array-contains queried) is how each user finds every
 * connection they're part of — incoming, outgoing, accepted, or history —
 * with a single realtime listener and no cross-user profile writes needed.
 */
export interface Connection {
  id: string;
  participants: [string, string];
  requestedBy: string;
  requestedByName: string;
  requestedByEmail: string;
  requestedToUid: string;
  requestedToName: string;
  requestedToEmail: string;
  status: ConnectionStatus;
  createdAt: number;
  updatedAt: number;
}

export type TaskCategory = "study" | "revision" | "practice" | "reading" | "exercise" | "break" | "other";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "not_started" | "running" | "paused" | "completed" | "skipped";
export type DayTemplate = "weekday" | "weekend";

export const TASK_CATEGORIES: TaskCategory[] = [
  "study",
  "revision",
  "practice",
  "reading",
  "exercise",
  "break",
  "other",
];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

/** A task inside a weekday/weekend template — the reusable "shape" of a routine item. */
export interface RoutineTask {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: TaskCategory;
  priority: TaskPriority;
  order: number;
}

/** Firestore document at routines/{uid} */
export interface RoutineTemplates {
  weekday: RoutineTask[];
  weekend: RoutineTask[];
  updatedAt: number;
}

/**
 * One day's live instance of a task — snapshotted from the template when the
 * day's checklist is first generated, so later template edits don't rewrite
 * a day already in progress.
 */
export interface TaskState {
  taskId: string;
  title: string;
  description: string;
  durationMinutes: number;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  elapsedSeconds: number;
  /** epoch ms the task was last (re)started; null when not currently running. */
  runningSince: number | null;
  completedAt: number | null;
}

/** Firestore document at dailyProgress/{uid}_{date} */
export interface DailyProgress {
  uid: string;
  date: string; // YYYY-MM-DD, local to the browser
  template: DayTemplate;
  taskStates: TaskState[];
  updatedAt: number;
}


