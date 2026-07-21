import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Guard against missing env vars with a clear setup message instead of a cryptic Firebase error.
function assertConfigured() {
  const missing = Object.entries(firebaseConfig).filter(([, v]) => !v);
  if (missing.length > 0 && typeof window !== "undefined") {
    console.error(
      "[SyncStudy] Missing Firebase config. Copy .env.local.example to .env.local and fill in your Firebase project keys."
    );
  }
}
assertConfigured();

// Reuse the existing app in dev (hot reload) instead of re-initializing.
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

/**
 * "Remember Login" toggle:
 * - local persistence survives full browser restarts.
 * - session persistence clears when the browser/tab is closed.
 */
export async function setAuthPersistence(remember: boolean) {
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
}
