const PREFIX = "syncstudy:";

export function getLocalBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(PREFIX + key);
  return raw === null ? fallback : raw === "true";
}

export function setLocalBoolean(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, String(value));
}

export function getLocalString(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PREFIX + key);
}

export function setLocalString(key: string, value: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + key, value);
}
