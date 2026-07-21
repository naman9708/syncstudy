"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { respondToConnection } from "@/lib/firebase/connections";
import { friendlyAuthError } from "@/lib/firebase/errors";
import type { Connection } from "@/types";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function IncomingRequestCard({ request }: { request: Connection }) {
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);

  async function respond(status: "accepted" | "rejected") {
    setBusy(status === "accepted" ? "accept" : "reject");
    try {
      await respondToConnection(request.id, status);
      if (status === "accepted") toast.success(`You and ${request.requestedByName} are now synced.`);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{initials(request.requestedByName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{request.requestedByName}</p>
          <p className="text-xs text-muted-foreground">wants to be your partner</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="outline" onClick={() => respond("rejected")} disabled={busy !== null} aria-label="Reject">
          {busy === "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
        </Button>
        <Button size="icon" onClick={() => respond("accepted")} disabled={busy !== null} aria-label="Accept">
          {busy === "accept" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
