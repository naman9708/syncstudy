import type { DailyProgress } from "@/types";

export interface DayStat {
  date: string; // YYYY-MM-DD
  studySeconds: number;
  completed: number;
  total: number;
  completionPct: number; // 0..1
}

export interface BucketStat {
  key: string;
  label: string;
  studySeconds: number;
  completed: number;
  total: number;
  completionPct: number; // 0..1
}

export function dailyStatsFromDocs(docs: DailyProgress[]): DayStat[] {
  return docs
    .map((doc) => {
      const total = doc.taskStates.length;
      const completed = doc.taskStates.filter((t) => t.status === "completed").length;
      const studySeconds = doc.taskStates.reduce((sum, t) => sum + t.elapsedSeconds, 0);
      return {
        date: doc.date,
        studySeconds,
        completed,
        total,
        completionPct: total > 0 ? completed / total : 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function mondayOf(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift back to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function aggregate(stats: DayStat[], keyFor: (date: string) => string, labelFor: (key: string) => string): BucketStat[] {
  const buckets = new Map<string, { studySeconds: number; completed: number; total: number }>();
  for (const stat of stats) {
    const key = keyFor(stat.date);
    const bucket = buckets.get(key) ?? { studySeconds: 0, completed: 0, total: 0 };
    bucket.studySeconds += stat.studySeconds;
    bucket.completed += stat.completed;
    bucket.total += stat.total;
    buckets.set(key, bucket);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, b]) => ({
      key,
      label: labelFor(key),
      studySeconds: b.studySeconds,
      completed: b.completed,
      total: b.total,
      completionPct: b.total > 0 ? b.completed / b.total : 0,
    }));
}

export function groupByWeek(stats: DayStat[]): BucketStat[] {
  return aggregate(
    stats,
    (date) => mondayOf(date),
    (key) => `Wk of ${new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
  );
}

export function groupByMonth(stats: DayStat[]): BucketStat[] {
  return aggregate(
    stats,
    (date) => date.slice(0, 7),
    (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
  );
}

export function groupByYear(stats: DayStat[]): BucketStat[] {
  return aggregate(
    stats,
    (date) => date.slice(0, 4),
    (key) => key
  );
}

/** Daily view is just the raw per-day stats, shaped like a BucketStat for a shared chart component. */
export function toDailyBuckets(stats: DayStat[]): BucketStat[] {
  return stats.map((s) => ({
    key: s.date,
    label: new Date(`${s.date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    studySeconds: s.studySeconds,
    completed: s.completed,
    total: s.total,
    completionPct: s.completionPct,
  }));
}

export interface ChartPoint {
  key: string;
  label: string;
  youHours: number;
  partnerHours: number;
  youCompletionPct: number;
  partnerCompletionPct: number;
}

/** Merges two bucket series (self + partner) into one chart-ready array, keyed by bucket. */
export function mergeForChart(self: BucketStat[], partner: BucketStat[]): ChartPoint[] {
  const partnerByKey = new Map(partner.map((b) => [b.key, b]));
  const allKeys = new Set([...self.map((b) => b.key), ...partner.map((b) => b.key)]);
  const selfByKey = new Map(self.map((b) => [b.key, b]));

  return [...allKeys]
    .sort()
    .map((key) => {
      const s = selfByKey.get(key);
      const p = partnerByKey.get(key);
      return {
        key,
        label: s?.label ?? p?.label ?? key,
        youHours: Math.round(((s?.studySeconds ?? 0) / 3600) * 10) / 10,
        partnerHours: Math.round(((p?.studySeconds ?? 0) / 3600) * 10) / 10,
        youCompletionPct: Math.round((s?.completionPct ?? 0) * 100),
        partnerCompletionPct: Math.round((p?.completionPct ?? 0) * 100),
      };
    });
}

function isDayComplete(stat: DayStat | undefined): boolean {
  return Boolean(stat && stat.total > 0 && stat.completed === stat.total);
}

/**
 * Current + longest streak, counted in "fully completed" days (every task
 * for that day marked complete). `stats` should be sorted ascending by date
 * and cover the window you want considered — an unfetched day outside that
 * window simply isn't counted, so streak counts are a floor, not an
 * absolute lifetime total.
 */
export function computeStreaks(stats: DayStat[], today: string): { current: number; longest: number } {
  const byDate = new Map(stats.map((s) => [s.date, s]));

  let longest = 0;
  let running = 0;
  for (const stat of stats) {
    if (isDayComplete(stat)) {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  // Current streak: walk backward from today. A today that's still in
  // progress (not yet fully complete) doesn't break the streak — it just
  // isn't counted yet — but a genuinely missed day does.
  let current = 0;
  const cursor = new Date(`${today}T00:00:00`);
  for (let i = 0; i < stats.length + 1; i++) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const stat = byDate.get(dateStr);
    if (dateStr === today && !isDayComplete(stat)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (isDayComplete(stat)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { current, longest };
}
