import { Flame, Timer, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function StatBlock({
  icon: Icon,
  label,
  youValue,
  partnerValue,
  hasPartner,
}: {
  icon: React.ElementType;
  label: string;
  youValue: string;
  partnerValue: string;
  hasPartner: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="h-4 w-4" />
          {label}
        </div>
        <div className="flex items-baseline gap-4">
          <div>
            <p className="font-mono font-tabular text-2xl font-semibold text-you">{youValue}</p>
            <p className="text-[11px] text-muted-foreground">You</p>
          </div>
          {hasPartner && (
            <div>
              <p className="font-mono font-tabular text-2xl font-semibold text-partner">{partnerValue}</p>
              <p className="text-[11px] text-muted-foreground">Partner</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatSummary({
  currentStreak,
  longestStreak,
  partnerCurrentStreak,
  partnerLongestStreak,
  youTotalHours,
  partnerTotalHours,
  hasPartner,
}: {
  currentStreak: number;
  longestStreak: number;
  partnerCurrentStreak: number;
  partnerLongestStreak: number;
  youTotalHours: number;
  partnerTotalHours: number;
  hasPartner: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatBlock
        icon={Flame}
        label="Current streak"
        youValue={`${currentStreak}d`}
        partnerValue={`${partnerCurrentStreak}d`}
        hasPartner={hasPartner}
      />
      <StatBlock
        icon={Trophy}
        label="Longest streak"
        youValue={`${longestStreak}d`}
        partnerValue={`${partnerLongestStreak}d`}
        hasPartner={hasPartner}
      />
      <StatBlock
        icon={Timer}
        label="Focus time (period)"
        youValue={`${youTotalHours}h`}
        partnerValue={`${partnerTotalHours}h`}
        hasPartner={hasPartner}
      />
    </div>
  );
}
