import { create } from "zustand";
import type { User } from "firebase/auth";

import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  /** True until the first onAuthStateChanged callback fires. */
  initializing: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setInitializing: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  initializing: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitializing: (initializing) => set({ initializing }),
  reset: () => set({ user: null, profile: null }),
}));
