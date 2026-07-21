"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setPrivacyMode } from "@/lib/firebase/profile";
import { friendlyAuthError } from "@/lib/firebase/errors";
import { useAuthStore } from "@/store/useAuthStore";

export function PrivacyToggle() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [saving, setSaving] = useState(false);

  async function handleChange(checked: boolean) {
    if (!user) return;
    setSaving(true);
    try {
      await setPrivacyMode(user.uid, checked);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Privacy</CardTitle>
        <CardDescription>
          Hide your current task&apos;s title and description from your partner&apos;s live view. They&apos;ll
          still see that you&apos;re online and your completion count — just not what you&apos;re working on.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <Label htmlFor="privacy" className="text-sm font-normal text-muted-foreground">
          Hide task details from partner
        </Label>
        <Switch
          id="privacy"
          checked={Boolean(profile?.privacyMode)}
          disabled={saving}
          onCheckedChange={handleChange}
        />
      </CardContent>
    </Card>
  );
}
