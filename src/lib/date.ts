import type { DayTemplate } from "@/types";

/** Local YYYY-MM-DD — used as (part of) the dailyProgress document id. */
export function todayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function currentDayTemplate(d: Date = new Date()): DayTemplate {
  const day = d.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6 ? "weekend" : "weekday";
}

/** YYYY-MM-DD, `days` before the given date string (0 = the same day). */
export function dateStringDaysAgo(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() - days);
  return todayDateString(d);
}
