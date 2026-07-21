"use client";

import { useEffect } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodaysChecklist } from "@/components/checklist/todays-checklist";
import { RoutineEditor } from "@/components/checklist/routine-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoutines } from "@/hooks/use-routines";
import { requestNotificationPermission } from "@/lib/notifications";

export default function ChecklistPage() {
  const { routines, loading } = useRoutines();

  // Ask once per session — harmless if the user dismisses it, and only used for a
  // "task completed" ping (no push service, no server involved).
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Checklist</h1>
        <p className="text-sm text-muted-foreground">
          Today&apos;s tasks switch automatically between your weekday and weekend routines.
        </p>
      </div>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="weekday">Weekday routine</TabsTrigger>
          <TabsTrigger value="weekend">Weekend routine</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <TodaysChecklist />
        </TabsContent>

        <TabsContent value="weekday">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <RoutineEditor day="weekday" tasks={routines.weekday} />
          )}
        </TabsContent>

        <TabsContent value="weekend">
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <RoutineEditor day="weekend" tasks={routines.weekend} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
