"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { searchPartnerSchema, type SearchPartnerInput } from "@/lib/validations/partner";
import { findUserByEmail, hasActiveConnection, sendPartnerRequest } from "@/lib/firebase/connections";
import { friendlyAuthError } from "@/lib/firebase/errors";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserProfile } from "@/types";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function SearchPartnerForm() {
  const me = useAuthStore((s) => s.profile);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<UserProfile | null>(null);
  const [searched, setSearched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchPartnerInput>({
    resolver: zodResolver(searchPartnerSchema),
    defaultValues: { email: "" },
  });

  async function onSearch(values: SearchPartnerInput) {
    if (!me) return;
    setSearching(true);
    setResult(null);
    setSearched(false);
    try {
      const normalized = values.email.trim().toLowerCase();
      if (normalized === me.email) {
        toast.error("That's your own email.");
        return;
      }
      const found = await findUserByEmail(normalized);
      setResult(found);
      setSearched(true);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest() {
    if (!me || !result) return;
    setSending(true);
    try {
      const targetTaken = await hasActiveConnection(result.uid);
      if (targetTaken) {
        toast.error(`${result.name} already has a partner or a pending request.`);
        return;
      }
      await sendPartnerRequest(me, result);
      toast.success(`Request sent to ${result.name}.`);
      setResult(null);
      setSearched(false);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="font-display text-base font-semibold">Find your partner</h2>
          <p className="text-sm text-muted-foreground">Search by the email they signed up with.</p>
        </div>

        <form onSubmit={handleSubmit(onSearch)} className="flex items-end gap-2" noValidate>
          <div className="flex-1 space-y-2">
            <Label htmlFor="partner-email">Partner&apos;s email</Label>
            <Input id="partner-email" type="email" placeholder="partner@college.edu" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" size="icon" variant="secondary" disabled={searching} aria-label="Search">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {searched && !result && (
          <p className="text-sm text-muted-foreground">
            No SyncStudy account found with that email.
          </p>
        )}

        {result && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials(result.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{result.name}</p>
                <p className="text-xs text-muted-foreground">{result.email}</p>
              </div>
            </div>
            <Button size="sm" onClick={handleSendRequest} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Send request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
