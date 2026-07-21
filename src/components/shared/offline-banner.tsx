"use client";

import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div className="flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
      <WifiOff className="h-3.5 w-3.5" />
      You&apos;re offline — changes will save once your connection is back.
    </div>
  );
}
