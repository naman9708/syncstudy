/** How often an active tab refreshes its own heartbeat. */
export const HEARTBEAT_INTERVAL_MS = 20_000;

/**
 * How stale a heartbeat can be before we consider the user offline.
 * Comfortably wider than the heartbeat interval so a single missed beat
 * (a slow network tick, a brief tab freeze) doesn't flicker to "offline".
 */
export const PRESENCE_ONLINE_THRESHOLD_MS = 45_000;
