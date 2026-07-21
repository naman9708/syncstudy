import { cn } from "@/lib/utils";

export function SyncMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 20"
      className={cn("h-5 w-8", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="10" r="9" className="fill-you/80" />
      <circle cx="20" cy="10" r="9" className="fill-partner/80" />
    </svg>
  );
}
