"use client";

import { useState } from "react";
import { Loader2, UserMinus } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PresenceDot } from "@/components/shared/presence-dot";
import { usePresence } from "@/hooks/use-presence";
import { removeConnection } from "@/lib/firebase/connections";
import { friendlyAuthError } from "@/lib/firebase/errors";
import type { UserProfile } from "@/types";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function ConnectedPartnerCard({
  connectionId,
  partner,
}: {
  connectionId: string;
  partner: UserProfile;
}) {
  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { isOnline } = usePresence(partner.uid);

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeConnection(connectionId);
      toast.success("Partner removed.");
      setOpen(false);
    } catch (error) {
      toast.error(friendlyAuthError(error));
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-partner/40">
              <AvatarFallback>{initials(partner.name)}</AvatarFallback>
            </Avatar>
            <PresenceDot online={isOnline} className="absolute -bottom-0.5 -right-0.5" />
          </div>
          <div>
            <p className="font-display text-base font-semibold">{partner.name}</p>
            <p className="text-sm text-muted-foreground">{partner.email}</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <UserMinus className="h-4 w-4" />
              Remove
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {partner.name} as your partner?</DialogTitle>
              <DialogDescription>
                You&apos;ll lose shared checklist and streak history together. This can&apos;t be undone,
                but you can always send a new request later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={removing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemove} disabled={removing}>
                {removing && <Loader2 className="h-4 w-4 animate-spin" />}
                Remove partner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
