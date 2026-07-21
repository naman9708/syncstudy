"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ListChecks, BarChart3, Settings } from "lucide-react";

import { cn } from "@/lib/utils";
import { SyncMark } from "@/components/shared/sync-mark";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partner", label: "Partner", icon: Users },
  { href: "/checklist", label: "Checklist", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2">
        <SyncMark className="h-5 w-8" />
        <span className="font-display text-base font-semibold">SyncStudy</span>
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
