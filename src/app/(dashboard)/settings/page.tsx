"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { ReminderToggle } from "@/components/settings/reminder-toggle";
import { PrivacyToggle } from "@/components/settings/privacy-toggle";
import { signOutUser } from "@/lib/firebase/auth";
import { friendlyAuthError } from "@/lib/firebase/errors";

export default function SettingsPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOutUser();
      router.replace("/login");
    } catch (error) {
      toast.error(friendlyAuthError(error));
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Your profile, appearance, and privacy.</p>
      </div>

      <ProfileForm />
      <ThemeToggle />
      <ReminderToggle />
      <PrivacyToggle />

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base">Log out</CardTitle>
          <CardDescription>You&apos;ll need to sign back in to see your checklist and partner.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout} disabled={loggingOut}>
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
