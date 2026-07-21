import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { Connection, ConnectionStatus, UserProfile } from "@/types";

const CONNECTIONS = "connections";

/** Firestore Timestamp -> epoch ms, tolerating the brief window before serverTimestamp() resolves. */
function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function fromDoc(id: string, data: Record<string, unknown>): Connection {
  return {
    id,
    participants: data.participants as [string, string],
    requestedBy: data.requestedBy as string,
    requestedByName: data.requestedByName as string,
    requestedByEmail: data.requestedByEmail as string,
    requestedToUid: data.requestedToUid as string,
    requestedToName: data.requestedToName as string,
    requestedToEmail: data.requestedToEmail as string,
    status: data.status as ConnectionStatus,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function findUserByEmail(email: string): Promise<UserProfile | null> {
  const normalized = email.trim().toLowerCase();
  const q = query(collection(db, "users"), where("email", "==", normalized), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as UserProfile;
}

/**
 * One-time check (not a listener) used only at the moment a request is sent,
 * to confirm the target doesn't already have a partner or pending request.
 */
export async function hasActiveConnection(uid: string): Promise<boolean> {
  const q = query(collection(db, CONNECTIONS), where("participants", "array-contains", uid));
  const snap = await getDocs(q);
  return snap.docs.some((d) => {
    const status = d.data().status as ConnectionStatus;
    return status === "pending" || status === "accepted";
  });
}

/**
 * One realtime listener per user covers every connection they're part of
 * (incoming requests, outgoing requests, the accepted partnership, and
 * history) — array-contains means a single query instead of separate
 * reads per relationship, keeping this within the Firestore free tier.
 */
export function subscribeToMyConnections(uid: string, callback: (connections: Connection[]) => void) {
  const q = query(collection(db, CONNECTIONS), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => fromDoc(d.id, d.data()));
    items.sort((a, b) => b.createdAt - a.createdAt);
    callback(items);
  });
}

export async function sendPartnerRequest(me: UserProfile, target: UserProfile) {
  await addDoc(collection(db, CONNECTIONS), {
    participants: [me.uid, target.uid],
    requestedBy: me.uid,
    requestedByName: me.name,
    requestedByEmail: me.email,
    requestedToUid: target.uid,
    requestedToName: target.name,
    requestedToEmail: target.email,
    status: "pending" as ConnectionStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function respondToConnection(connectionId: string, status: "accepted" | "rejected") {
  await updateDoc(doc(db, CONNECTIONS, connectionId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function removeConnection(connectionId: string) {
  await updateDoc(doc(db, CONNECTIONS, connectionId), {
    status: "removed" as ConnectionStatus,
    updatedAt: serverTimestamp(),
  });
}
