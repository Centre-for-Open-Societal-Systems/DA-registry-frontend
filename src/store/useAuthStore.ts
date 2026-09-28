import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/rbac";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Active RBAC role, fixed by the account signed in at /login; drives nav visibility and gated actions. */
  role: Role;
  /** False until the persisted session has been read back (see AuthHydration); guards wait on it. */
  hasHydrated: boolean;
  setUser: (user: AuthUser) => void;
  /** Sign-in result: identity and role land together so the dashboard renders for the right role. */
  signIn: (user: AuthUser, role: Role) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

const DEFAULT_ROLE: Role = "Supervisor";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: DEFAULT_ROLE,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      signIn: (user, role) => set({ user, role, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, role: DEFAULT_ROLE }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      // Survives a refresh so a signed-in role does not fall back to the default mid-session.
      name: "oan-auth",
      // Rehydrated after mount (see AuthHydration) so the first client render matches the server HTML.
      skipHydration: true,
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, role: s.role }),
      // Runs after every rehydrate, including the empty-storage case, so the guard never waits forever.
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
