"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/useAuthStore";
import { usePresenceHeartbeat } from "@/hooks/use-presence-heartbeat";
import { useReminderScheduler } from "@/hooks/use-reminder-scheduler";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Topbar } from "@/components/dashboard/topbar";
import { SyncMark } from "@/components/shared/sync-mark";
import { OfflineBanner } from "@/components/shared/offline-banner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const initializing = useAuthStore((s) => s.initializing);

  usePresenceHeartbeat();
  useReminderScheduler();

  useEffect(() => {
    if (!initializing && !user) router.replace("/login");
  }, [user, initializing, router]);

  if (initializing || !user) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <SyncMark className="h-6 w-10 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <OfflineBanner />
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
