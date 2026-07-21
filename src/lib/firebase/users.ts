import { doc, onSnapshot } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { UserProfile } from "@/types";

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  });
}
