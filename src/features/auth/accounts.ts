import type { Role } from "@/lib/rbac";

// Demo sign-in accounts — one per RBAC role, so signing in lands the user on their own role home.
// There is no auth backend yet (FSD Part 1): credentials are matched in the browser against this list
// and nothing is sent anywhere. Replace this module with the real auth call when the API exists.

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  name: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "developmentagent@gmail.com", password: "development@123", role: "DA", name: "Tadesse Alemu" },
  { email: "supervisor@gmail.com", password: "supervisor@g123", role: "Supervisor", name: "Almaz Tesfaye" },
  { email: "executive@gmail.com", password: "executive@123", role: "Executive", name: "Dawit Haile" },
  { email: "admin@gmail.com", password: "admin@123", role: "Admin", name: "Selam Bekele" },
  { email: "communications@gmail.com", password: "communications@123", role: "CommsOfficer", name: "Hana Girma" },
];

/** Case-insensitive on the email, exact on the password. Returns undefined when nothing matches. */
export function findAccount(email: string, password: string): DemoAccount | undefined {
  const wanted = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.email === wanted && a.password === password);
}
