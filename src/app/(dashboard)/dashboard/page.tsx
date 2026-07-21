"use client";

import Link from "next/link";
import { Flame, Clock, UserPlus, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PresenceDot } from "@/components/shared/presence-dot";
import { SyncRing } from "@/components/dashboard/sync-ring";
import { PartnerLiveCard } from "@/components/dashboard/partner-live-card";
import { useAuthStore } from "@/store/useAuthStore";
import { usePartnerConnection } from "@/hooks/use-partner-connection";
import { useTodaysChecklist } from "@/hooks/use-todays-checklist";
import { usePartnerDailyProgress } from "@/hooks/use-partner-daily-progress";
import { usePresence } from "@/hooks/use-presence";
import { useLiveTotalElapsed } from "@/hooks/use-live-total-elapsed";
import { useMyStreak } from "@/hooks/use-my-streak";
import { formatDuration } from "@/lib/format";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const { loading: partnerLoading, accepted, incoming, outgoing, partnerProfile, partnerUid } =
    usePartnerConnection();
  const { progress: todaysProgress } = useTodaysChecklist();
  const { progress: partnerProgress, loading: partnerProgressLoading } = usePartnerDailyProgress(partnerUid);
  const { isOnline: selfOnline } = usePresence(user?.uid ?? null);
  const { current: currentStreak } = useMyStreak();

  const name = profile?.name || user?.displayName || "Student";
  const profileIncomplete = profile && !(profile.college && profile.branch && profile.semester);

  const tasks = todaysProgress?.taskStates ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const youProgress = tasks.length > 0 ? completed / tasks.length : 0;
  const studySeconds = useLiveTotalElapsed(tasks);

  const partnerTasks = partnerProgress?.taskStates ?? [];
  const partnerCompleted = partnerTasks.filter((t) => t.status === "completed").length;
  const partnerRatio = partnerTasks.length > 0 ? partnerCompleted / partnerTasks.length : 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {profileIncomplete && (
        <Card className="border-primary/30 bg-accent">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Your college, branch, and semester are still empty. Add them from your profile.
            </p>
            <Button asChild size="sm" variant="secondary">
              <Link href="/settings">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Twin identity: You / Partner */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <div className="relative">
              <Avatar className="h-11 w-11 ring-2 ring-you/40">
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
              <PresenceDot online={selfOnline} className="absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <CardDescription>That&apos;s you</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {tasks.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {completed} of {tasks.length} tasks done today.{" "}
                <Link href="/checklist" className="text-primary hover:underline">
                  Open checklist
                </Link>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tasks in today&apos;s routine yet.{" "}
                <Link href="/checklist" className="text-primary hover:underline">
                  Build your routine
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        {partnerLoading ? (
          <Card className="animate-pulse border-dashed" />
        ) : accepted && partnerProfile ? (
          <PartnerLiveCard partner={partnerProfile} progress={partnerProgress} loading={partnerProgressLoading} />
        ) : (
          <Card className="border-dashed">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-partner/50 text-partner">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">
                  {incoming.length > 0
                    ? `${incoming[0].requestedByName} wants to connect`
                    : outgoing.length > 0
                      ? "Request pending"
                      : "No partner yet"}
                </CardTitle>
                <CardDescription>Accountability needs two</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm" variant="secondary">
                <Link href="/partner">
                  <Users className="h-4 w-4" />
                  {incoming.length > 0
                    ? "Review request"
                    : outgoing.length > 0
                      ? "View pending request"
                      : "Find your partner"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Today's sync + quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Today&apos;s sync</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pb-6">
            <SyncRing youProgress={youProgress} partnerProgress={partnerRatio} size={140} />
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-you" /> You — {Math.round(youProgress * 100)}%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-partner" /> Partner — {Math.round(partnerRatio * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Flame className="h-4 w-4 text-warning" />
              Current streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono font-tabular text-4xl font-semibold">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">day{currentStreak === 1 ? "" : "s"} in a row</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              Study time today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono font-tabular text-4xl font-semibold">{formatDuration(studySeconds)}</p>
            <p className="text-xs text-muted-foreground">tracked via the focus timer</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        See trends and your full history in <Link href="/analytics" className="underline">Analytics</Link>.
      </p>
    </div>
  );
}
