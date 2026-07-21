"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { removeConnection } from "@/lib/firebase/connections";
import { friendlyAuthError } from "@/lib/firebase/errors";
import type { Connection } from "@/types";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function OutgoingRequestCard({ request }: { request: Connection }) {
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    try {
      await removeConnection(request.id);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>{initials(request.requestedToName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{request.requestedToName}</p>
          <p className="text-xs text-muted-foreground">Request pending…</p>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={handleCancel} disabled={cancelling}>
        {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
        Cancel
      </Button>
    </div>
  );
}
