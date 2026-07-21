"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { StudyHoursChart } from "@/components/analytics/study-hours-chart";
import { CompletionChart } from "@/components/analytics/completion-chart";
import { StatSummary } from "@/components/analytics/stat-summary";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  groupByMonth,
  groupByWeek,
  groupByYear,
  mergeForChart,
  toDailyBuckets,
  type BucketStat,
} from "@/lib/analytics";

function lastN<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, arr.length - n));
}

function AnalyticsView({
  selfBuckets,
  partnerBuckets,
  hasPartner,
}: {
  selfBuckets: BucketStat[];
  partnerBuckets: BucketStat[];
  hasPartner: boolean;
}) {
  const chartData = useMemo(() => mergeForChart(selfBuckets, partnerBuckets), [selfBuckets, partnerBuckets]);

  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-14 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No completed checklist days in this range yet — finish a few tasks to see charts here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <StudyHoursChart data={chartData} hasPartner={hasPartner} />
      <CompletionChart data={chartData} hasPartner={hasPartner} />
    </div>
  );
}

export default function AnalyticsPage() {
  const { loading, selfStats, partnerStats, hasPartner, streaks, partnerStreaks } = useAnalytics();

  const dailySelf = useMemo(() => lastN(toDailyBuckets(selfStats), 14), [selfStats]);
  const dailyPartner = useMemo(() => lastN(toDailyBuckets(partnerStats), 14), [partnerStats]);

  const weeklySelf = useMemo(() => lastN(groupByWeek(selfStats), 12), [selfStats]);
  const weeklyPartner = useMemo(() => lastN(groupByWeek(partnerStats), 12), [partnerStats]);

  const monthlySelf = useMemo(() => lastN(groupByMonth(selfStats), 12), [selfStats]);
  const monthlyPartner = useMemo(() => lastN(groupByMonth(partnerStats), 12), [partnerStats]);

  const yearlySelf = useMemo(() => groupByYear(selfStats), [selfStats]);
  const yearlyPartner = useMemo(() => groupByYear(partnerStats), [partnerStats]);

  const periodHours = (buckets: BucketStat[]) =>
    Math.round((buckets.reduce((sum, b) => sum + b.studySeconds, 0) / 3600) * 10) / 10;

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Study hours and completion, you vs. your partner, over time.
        </p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <StatSummary
            currentStreak={streaks.current}
            longestStreak={streaks.longest}
            partnerCurrentStreak={partnerStreaks?.current ?? 0}
            partnerLongestStreak={partnerStreaks?.longest ?? 0}
            youTotalHours={periodHours(dailySelf)}
            partnerTotalHours={periodHours(dailyPartner)}
            hasPartner={hasPartner}
          />
          <AnalyticsView selfBuckets={dailySelf} partnerBuckets={dailyPartner} hasPartner={hasPartner} />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <StatSummary
            currentStreak={streaks.current}
            longestStreak={streaks.longest}
            partnerCurrentStreak={partnerStreaks?.current ?? 0}
            partnerLongestStreak={partnerStreaks?.longest ?? 0}
            youTotalHours={periodHours(weeklySelf)}
            partnerTotalHours={periodHours(weeklyPartner)}
            hasPartner={hasPartner}
          />
          <AnalyticsView selfBuckets={weeklySelf} partnerBuckets={weeklyPartner} hasPartner={hasPartner} />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <StatSummary
            currentStreak={streaks.current}
            longestStreak={streaks.longest}
            partnerCurrentStreak={partnerStreaks?.current ?? 0}
            partnerLongestStreak={partnerStreaks?.longest ?? 0}
            youTotalHours={periodHours(monthlySelf)}
            partnerTotalHours={periodHours(monthlyPartner)}
            hasPartner={hasPartner}
          />
          <AnalyticsView selfBuckets={monthlySelf} partnerBuckets={monthlyPartner} hasPartner={hasPartner} />
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <StatSummary
            currentStreak={streaks.current}
            longestStreak={streaks.longest}
            partnerCurrentStreak={partnerStreaks?.current ?? 0}
            partnerLongestStreak={partnerStreaks?.longest ?? 0}
            youTotalHours={periodHours(yearlySelf)}
            partnerTotalHours={periodHours(yearlyPartner)}
            hasPartner={hasPartner}
          />
          <AnalyticsView selfBuckets={yearlySelf} partnerBuckets={yearlyPartner} hasPartner={hasPartner} />
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground">
        Covers up to the last 13 months of checklist history.
      </p>
    </div>
  );
}
