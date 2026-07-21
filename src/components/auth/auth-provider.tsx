"use client";

import { useEffect } from "react";

import { subscribeToAuthChanges } from "@/lib/firebase/auth";
import { subscribeToUserProfile } from "@/lib/firebase/users";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const unsubAuth = subscribeToAuthChanges((user) => {
      setUser(user);
      setInitializing(false);

      // Tear down the previous profile listener whenever the auth user changes.
      unsubProfile?.();

      if (user) {
        unsubProfile = subscribeToUserProfile(user.uid, setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      unsubAuth();
      unsubProfile?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
