import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role } from "@/lib/rbac";
import { clearAllDrafts } from "@/lib/drafts";
import { revokeRefreshToken } from "@/lib/authApi";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /**
   * Backend refresh token, revoked on logout. Always null for now: sign-in still uses the demo accounts, and
   * the backend login that will set it is parked (docs/patches/login-api.patch).
   */
  refreshToken: string | null;
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
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      refreshToken: null,
      role: DEFAULT_ROLE,
      hasHydrated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      signIn: (user, role) => set({ user, role, isAuthenticated: true }),
      logout: () => {
        // Drafts hold farmer and visit personal data; none of it may outlive the session.
        clearAllDrafts();
        // Revoke server-side too, so a copied refresh token is useless once the user has logged out.
        const { refreshToken } = get();
        if (refreshToken) void revokeRefreshToken(refreshToken);
        set({ user: null, isAuthenticated: false, refreshToken: null, role: DEFAULT_ROLE });
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      // Survives a refresh so a signed-in role does not fall back to the default mid-session.
      name: "oan-auth",
      // Rehydrated after mount (see AuthHydration) so the first client render matches the server HTML.
      skipHydration: true,
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, role: s.role, refreshToken: s.refreshToken }),
      // Runs after every rehydrate, including the empty-storage case, so the guard never waits forever.
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
