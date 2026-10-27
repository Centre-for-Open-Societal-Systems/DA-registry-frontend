import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ROLES } from "@/lib/rbac";
import { DEMO_ACCOUNTS, type DemoAccount } from "./accounts";

/** Roles a person may pick when registering — all five portal roles. */
export const SELF_REGISTER_ROLES = ROLES.filter((r) => r !== "SuperAdmin");

interface RegisteredAccountsState {
  accounts: DemoAccount[];
  /** Adds the account; returns false when the email is already taken. */
  register: (account: DemoAccount) => boolean;
}

// Accounts created from the login page's Register form. No auth backend yet, so they live in this browser's
// storage only and work for sign-in on this device until the real registration API replaces this store.
export const useRegisteredAccountsStore = create<RegisteredAccountsState>()(
  persist(
    (set, get) => ({
      accounts: [],
      register: (account) => {
        if (isEmailTaken(account.email, get().accounts)) return false;
        set((s) => ({ accounts: [...s.accounts, { ...account, email: account.email.trim().toLowerCase() }] }));
        return true;
      },
    }),
    { name: "oan-registered-accounts" },
  ),
);

export const isEmailTaken = (email: string, registered: DemoAccount[]) => {
  const wanted = email.trim().toLowerCase();
  return [...DEMO_ACCOUNTS, ...registered].some((a) => a.email === wanted);
};
