import type { Role } from "@/lib/rbac";

// Former demo sign-in accounts. Login now goes to the backend (see ./login); the Register page still checks
// new emails against this list so it does not hand out one of these addresses.

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
