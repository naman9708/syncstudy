import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db, setAuthPersistence } from "@/lib/firebase/client";
import type { SignupInput } from "@/lib/validations/auth";

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signUpWithEmail(data: SignupInput) {
  const email = data.email.trim().toLowerCase();
  const credential = await createUserWithEmailAndPassword(auth, email, data.password);
  await updateProfile(credential.user, { displayName: data.name });

  // Seed the Firestore profile doc used across the app (dashboard, partner search, etc.)
  await setDoc(doc(db, "users", credential.user.uid), {
    uid: credential.user.uid,
    name: data.name,
    email,
    college: "",
    branch: "",
    semester: "",
    partnerId: null,
    privacyMode: false,
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export async function signInWithEmail(email: string, password: string, remember: boolean) {
  await setAuthPersistence(remember);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}
