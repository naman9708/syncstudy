import { cn } from "@/lib/utils";

export function PresenceDot({ online, className }: { online: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "h-2.5 w-2.5 rounded-full ring-2 ring-card",
        online ? "bg-you" : "bg-muted-foreground/40",
        className
      )}
      aria-label={online ? "Online" : "Offline"}
    />
  );
}
