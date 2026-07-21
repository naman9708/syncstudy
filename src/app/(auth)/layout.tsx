"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";
import { SyncMark } from "@/components/shared/sync-mark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  useEffect(() => {
    if (!initializing && user) router.replace("/dashboard");
  }, [user, initializing, router]);

  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      {/* Branding panel — hidden on small screens */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex">
        <div className="flex items-center gap-2">
          <SyncMark className="h-6 w-10" />
          <span className="font-display text-lg font-semibold">SyncStudy</span>
        </div>

        <div className="space-y-4">
          <p className="max-w-sm font-display text-3xl leading-tight">
            Two schedules.
            <br />
            One streak.
          </p>
          <p className="max-w-sm text-sm text-background/70">
            SyncStudy pairs you with exactly one accountability partner, so
            your daily routine is never done alone.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-background/50">
          <span>Weekday + weekend routines</span>
          <span>Live partner presence</span>
        </div>

        {/* Signature: two rings drifting toward alignment */}
        <svg
          className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 opacity-[0.14]"
          viewBox="0 0 200 200"
          aria-hidden="true"
        >
          <circle cx="80" cy="100" r="70" className="fill-you" />
          <circle cx="120" cy="100" r="70" className="fill-partner" />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex flex-col items-center justify-center gap-8 p-6 sm:p-10">
        <div className="flex items-center gap-2 lg:hidden">
          <SyncMark className="h-5 w-8" />
          <span className="font-display text-base font-semibold">SyncStudy</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
