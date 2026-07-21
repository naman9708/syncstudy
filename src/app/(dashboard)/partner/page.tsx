"use client";

import { Users } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { SearchPartnerForm } from "@/components/partner/search-partner-form";
import { IncomingRequestCard } from "@/components/partner/incoming-request-card";
import { OutgoingRequestCard } from "@/components/partner/outgoing-request-card";
import { ConnectedPartnerCard } from "@/components/partner/connected-partner-card";
import { usePartnerConnection } from "@/hooks/use-partner-connection";

export default function PartnerPage() {
  const { loading, accepted, incoming, outgoing, partnerProfile, hasActiveOrPending } =
    usePartnerConnection();

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Partner</h1>
        <p className="text-sm text-muted-foreground">
          SyncStudy is built for two — connect with exactly one accountability partner.
        </p>
      </div>

      {accepted && partnerProfile ? (
        <ConnectedPartnerCard connectionId={accepted.id} partner={partnerProfile} />
      ) : (
        <>
          {!hasActiveOrPending && <SearchPartnerForm />}

          {incoming.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Requests waiting on you</h2>
              {incoming.map((req) => (
                <IncomingRequestCard key={req.id} request={req} />
              ))}
            </div>
          )}

          {outgoing.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Sent by you</h2>
              {outgoing.map((req) => (
                <OutgoingRequestCard key={req.id} request={req} />
              ))}
            </div>
          )}

          {incoming.length === 0 && outgoing.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                Search for your partner above to send a request.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
