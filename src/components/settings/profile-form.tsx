"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileFormSchema, type ProfileFormInput } from "@/lib/validations/profile";
import { updateUserProfile } from "@/lib/firebase/profile";
import { friendlyAuthError } from "@/lib/firebase/errors";
import { useAuthStore } from "@/store/useAuthStore";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ProfileForm() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: "", college: "", branch: "", semester: "" },
  });

  // Seed the form once the live profile doc arrives (it isn't available on the very first render).
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        college: profile.college,
        branch: profile.branch,
        semester: profile.semester,
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: ProfileFormInput) {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, values);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setSaving(false);
    }
  }

  const displayName = profile?.name || user?.displayName || "Student";

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <Avatar className="h-14 w-14 ring-2 ring-you/40">
          <AvatarFallback className="text-base">{initials(displayName)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Default avatar only — no photo uploads.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">Your email can&apos;t be changed here.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input id="college" placeholder="Poornima University" {...register("college")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input id="branch" placeholder="Computer Science" {...register("branch")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Input id="semester" placeholder="5th" {...register("semester")} />
          </div>

          <Button type="submit" disabled={saving || !isDirty}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
