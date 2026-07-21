"use client";

import { Flame, Lock, ListChecks, Timer } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PresenceDot } from "@/components/shared/presence-dot";
import { usePresence } from "@/hooks/use-presence";
import { useLiveElapsed } from "@/hooks/use-live-elapsed";
import { useLiveTotalElapsed } from "@/hooks/use-live-total-elapsed";
import { useStreakFor } from "@/hooks/use-streak-for";
import { formatDuration } from "@/lib/format";
import type { DailyProgress, TaskState, UserProfile } from "@/types";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/** Isolated so useLiveElapsed only ever runs against a task that actually exists. */
function RunningTaskLine({ task, hidden }: { task: TaskState; hidden: boolean }) {
  const seconds = useLiveElapsed(task);
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-you opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-you" />
      </span>
      <p className="truncate text-sm font-medium">
        {hidden ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Lock className="h-3 w-3" /> In a focus session
          </span>
        ) : (
          task.title
        )}
      </p>
      <span className="ml-auto flex items-center gap-1 font-mono text-xs tabular-nums text-muted-foreground">
        <Timer className="h-3 w-3" />
        {formatDuration(seconds)}
      </span>
    </div>
  );
}

export function PartnerLiveCard({
  partner,
  progress,
  loading,
}: {
  partner: UserProfile;
  progress: DailyProgress | null;
  loading: boolean;
}) {
  const { isOnline } = usePresence(partner.uid);
  const { current: streak } = useStreakFor(partner.uid);

  const tasks = progress?.taskStates ?? [];
  const completed = tasks.filter((t) => t.status === "completed").length;
  const runningTask = tasks.find((t) => t.status === "running") ?? null;
  const studySeconds = useLiveTotalElapsed(tasks);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="relative">
          <Avatar className="h-11 w-11 ring-2 ring-partner/40">
            <AvatarFallback>{initials(partner.name)}</AvatarFallback>
          </Avatar>
          <PresenceDot online={isOnline} className="absolute -bottom-0.5 -right-0.5" />
        </div>
        <div>
          <CardTitle className="text-base">{partner.name}</CardTitle>
          <CardDescription>{isOnline ? "Online now" : "Offline"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            {runningTask ? (
              <RunningTaskLine task={runningTask} hidden={Boolean(partner.privacyMode)} />
            ) : (
              <p className="text-sm text-muted-foreground">Not studying right now.</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className="gap-1">
                <ListChecks className="h-3 w-3" />
                {tasks.length > 0 ? `${completed}/${tasks.length} done` : "No routine set"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Timer className="h-3 w-3" />
                {formatDuration(studySeconds)} today
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3" />
                {streak}-day streak
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
