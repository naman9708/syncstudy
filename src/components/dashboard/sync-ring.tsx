"use client";

const R = 40;
const CIRC = 2 * Math.PI * R;

function ringDash(progress: number) {
  const clamped = Math.max(0, Math.min(1, progress));
  return `${CIRC * clamped} ${CIRC}`;
}

export function SyncRing({
  youProgress,
  partnerProgress,
  size = 160,
}: {
  /** 0..1 */
  youProgress: number;
  /** 0..1 */
  partnerProgress: number;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
      <circle cx="50" cy="50" r={R} className="fill-none stroke-muted" strokeWidth="7" />
      <circle
        cx="50"
        cy="50"
        r={R}
        className="fill-none stroke-you transition-[stroke-dasharray] duration-700 ease-out"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={ringDash(youProgress)}
      />
      <circle
        cx="50"
        cy="50"
        r={R - 10}
        className="fill-none stroke-muted"
        strokeWidth="6"
      />
      <circle
        cx="50"
        cy="50"
        r={R - 10}
        className="fill-none stroke-partner transition-[stroke-dasharray] duration-700 ease-out"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={ringDash(partnerProgress)}
      />
    </svg>
  );
}
