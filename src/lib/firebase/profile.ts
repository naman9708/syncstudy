import { updateProfile as updateAuthProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase/client";
import type { ProfileFormInput } from "@/lib/validations/profile";

export async function updateUserProfile(uid: string, data: ProfileFormInput) {
  await updateDoc(doc(db, "users", uid), {
    name: data.name,
    college: data.college,
    branch: data.branch,
    semester: data.semester,
  });

  // Keep Firebase Auth's displayName (used as a fallback name in a few places) in sync.
  if (auth.currentUser && auth.currentUser.displayName !== data.name) {
    await updateAuthProfile(auth.currentUser, { displayName: data.name });
  }
}

export async function setPrivacyMode(uid: string, enabled: boolean) {
  await updateDoc(doc(db, "users", uid), { privacyMode: enabled });
}
