"use client";

import { useEffect, useState } from "react";

import { subscribeToMyConnections } from "@/lib/firebase/connections";
import { subscribeToUserProfile } from "@/lib/firebase/users";
import { useAuthStore } from "@/store/useAuthStore";
import type { Connection, UserProfile } from "@/types";

export function usePartnerConnection() {
  const user = useAuthStore((s) => s.user);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToMyConnections(user.uid, (items) => {
      setConnections(items);
      setLoading(false);
    });
    return () => {
      unsub();
      setConnections([]);
      setLoading(false);
    };
  }, [user]);

  const accepted = connections.find((c) => c.status === "accepted") ?? null;
  const incoming = connections.filter((c) => c.status === "pending" && c.requestedToUid === user?.uid);
  const outgoing = connections.filter((c) => c.status === "pending" && c.requestedBy === user?.uid);
  const partnerUid = accepted ? accepted.participants.find((id) => id !== user?.uid) ?? null : null;
  const hasActiveOrPending = Boolean(accepted) || outgoing.length > 0 || incoming.length > 0;

  useEffect(() => {
    if (!partnerUid) return;
    const unsub = subscribeToUserProfile(partnerUid, setPartnerProfile);
    return () => {
      unsub();
      setPartnerProfile(null);
    };
  }, [partnerUid]);

  return {
    loading,
    accepted,
    incoming,
    outgoing,
    partnerUid,
    partnerProfile,
    /** True once you have a partner or any pending request (sent or received) — search stays hidden until it's resolved. */
    hasActiveOrPending,
  };
}
