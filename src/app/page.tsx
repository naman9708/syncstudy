"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";

export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => {
    if (initializing) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, initializing, router]);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 animate-pulse rounded-full bg-you" />
          <span className="h-3 w-3 animate-pulse rounded-full bg-partner [animation-delay:150ms]" />
        </div>
        <p className="font-display text-sm text-muted-foreground">Syncing…</p>
      </div>
    </div>
  );
}
