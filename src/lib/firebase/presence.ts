import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";

const COLLECTION = "presence";

export async function writeHeartbeat(uid: string) {
  await setDoc(doc(db, COLLECTION, uid), { uid, lastSeenAt: serverTimestamp() }, { merge: true });
}

/** callback receives the last heartbeat as epoch ms, or null if the user has never been seen. */
export function subscribeToPresence(uid: string, callback: (lastSeenAt: number | null) => void) {
  return onSnapshot(doc(db, COLLECTION, uid), (snap) => {
    const data = snap.data();
    const ts = data?.lastSeenAt;
    if (ts && typeof ts === "object" && "toMillis" in ts) {
      callback((ts as { toMillis: () => number }).toMillis());
    } else {
      callback(null);
    }
  });
}
