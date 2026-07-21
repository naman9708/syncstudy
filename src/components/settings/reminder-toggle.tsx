"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useReminderSetting } from "@/hooks/use-reminder-setting";

export function ReminderToggle() {
  const { enabled, setEnabled } = useReminderSetting();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reminders</CardTitle>
        <CardDescription>
          A browser notification if today&apos;s checklist is still incomplete by 8 PM. Device-local —
          no push service, and it only fires while SyncStudy is open in a tab.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Label htmlFor="reminders" className="text-sm font-normal text-muted-foreground">
          Evening reminder
        </Label>
        <Switch id="reminders" checked={enabled} onCheckedChange={setEnabled} />
      </CardContent>
    </Card>
  );
}
