// Role model and role-scoped navigation (FSD D3 §2.2, §2.4, §3.1.1, Appendix B/D).
// Navigation is deny-by-default: an item is visible only to the roles listed on it.

export const ROLES = ["DA", "Supervisor", "Executive", "Admin", "CommsOfficer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  DA: "Development Agent",
  Supervisor: "Supervisor (Woreda)",
  Executive: "Executive (Regional)",
  Admin: "OAN / ATI Administrator",
  CommsOfficer: "Communications Officer",
};

/** Scope line shown under the role in the sidebar footer (Appendix D: identity shown in the sidebar footer). */
export const ROLE_SCOPES: Record<Role, string> = {
  DA: "Own record · Bako Tibe",
  Supervisor: "Woreda · Bako Tibe",
  Executive: "Region · Oromia (read)",
  Admin: "All regions",
  CommsOfficer: "Broadcast domain",
};

export type Part = 1 | 2 | "shared";

export interface NavItem {
  title: string;
  href: string;
  roles: readonly Role[];
  /** Part 2 items are rendered but disabled ("coming soon") — the nav shape is final per §2.4. */
  part: Part;
}

export interface NavGroup {
  /** Empty title = the ungrouped "Top" group. */
  title: string;
  items: NavItem[];
}

const ALL: readonly Role[] = ROLES;
const OFFICERS: readonly Role[] = ["Supervisor", "Executive", "Admin"];

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "",
    items: [
      { title: "Dashboard", href: "/dashboard", roles: ALL, part: "shared" },
    ],
  },
  {
    title: "Farmer Management",
    items: [
      { title: "My Farmers", href: "/farmers", roles: ["DA", "Supervisor", "Executive"], part: 1 },
      { title: "Beneficiaries", href: "/beneficiaries", roles: ["DA", "Supervisor", "Admin"], part: 1 },
      { title: "Grievances", href: "/grievances", roles: ["DA", "Supervisor", "Admin"], part: 1 },
    ],
  },
  {
    title: "Agent Registry",
    items: [
      // The DA sees their own Woreda team here; the full registry is for officers.
      { title: "My Teams", href: "/my-teams", roles: ["DA"], part: 1 },
      { title: "Agents", href: "/agents", roles: OFFICERS, part: 1 },
      // Supervisor sees field operations here (visits + kebele assignment) instead of the registry-admin items
      { title: "Field Visits", href: "/visits", roles: ["Supervisor"], part: 1 },
      { title: "Assignments", href: "/assignments", roles: ["Supervisor"], part: 1 },
      { title: "Approvals", href: "/approvals", roles: ["Admin"], part: 1 },
      { title: "Registry Sync", href: "/registry-sync", roles: ["Admin"], part: 1 },
      { title: "Internal Feedback", href: "/feedback", roles: ["DA", "Supervisor", "Admin"], part: 1 },
      { title: "Lifecycle", href: "/lifecycle", roles: ["Admin"], part: 2 },
    ],
  },
  {
    title: "Communication",
    items: [
      { title: "Knowledge Base", href: "/knowledge", roles: ALL, part: 1 },
      { title: "Broadcast", href: "/broadcast", roles: ["CommsOfficer", "Admin"], part: 1 },
      { title: "Alerts", href: "/alerts", roles: ["CommsOfficer", "Admin", "Supervisor"], part: 1 },
      { title: "Advisors", href: "/advisors", roles: ALL, part: 2 },
    ],
  },
  {
    title: "Performance",
    items: [
      { title: "My Performance", href: "/performance", roles: ["DA", "Supervisor"], part: 1 },
      { title: "Surveys", href: "/surveys", roles: ["DA", "Supervisor"], part: 1 },
      { title: "KPIs", href: "/kpis", roles: OFFICERS, part: 2 },
      { title: "Reviews", href: "/reviews", roles: OFFICERS, part: 2 },
      { title: "Training", href: "/training", roles: ["DA", ...OFFICERS], part: 2 },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users & Roles", href: "/admin/users", roles: ["Admin"], part: "shared" },
      { title: "Reports", href: "/admin/reports", roles: OFFICERS, part: "shared" },
      { title: "Settings", href: "/admin/settings", roles: ["Admin"], part: "shared" },
    ],
  },
];

/** Groups + items the given role may see; groups with nothing visible are dropped. */
export function navForRole(role: Role): NavGroup[] {
  const groups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(role)) })).filter((g) => g.items.length > 0);
  // Admin works registry-first: Agent Registry sits right after the Dashboard, Farmer Management second.
  if (role !== "Admin") return groups;
  const registry = groups.find((g) => g.title === "Agent Registry");
  if (!registry) return groups;
  const rest = groups.filter((g) => g !== registry);
  return [rest[0], registry, ...rest.slice(1)];
}

/** Sub-routes that are not their own nav item but belong under a parent for the header title. */
export const PAGE_TITLES: { prefix: string; title: string }[] = [
  { prefix: "/dashboard", title: "Dashboard" },
  { prefix: "/profile", title: "My Profile" },
  { prefix: "/agents/daid", title: "DA-ID Management" },
  { prefix: "/agents/fayda", title: "Fayda Verification" },
  { prefix: "/agents/", title: "DA Profile" },
  { prefix: "/agents", title: "Agents" },
  { prefix: "/my-teams", title: "My Teams" },
  { prefix: "/approvals", title: "Approvals" },
  { prefix: "/registry-sync", title: "Registry Sync" },
  { prefix: "/feedback", title: "Internal Feedback" },
  { prefix: "/lifecycle", title: "Lifecycle" },
  { prefix: "/farmers/new", title: "Register Farmer" },
  { prefix: "/farmers/", title: "Farmer Profile" },
  { prefix: "/farmers", title: "My Farmers" },
  { prefix: "/visits/", title: "Visit Planner" },
  { prefix: "/visits", title: "Visits" },
  { prefix: "/assignments", title: "Agent Assignment" },
  { prefix: "/beneficiaries", title: "Beneficiaries" },
  { prefix: "/grievances", title: "Grievances" },
  { prefix: "/knowledge/", title: "Article" },
  { prefix: "/knowledge", title: "Knowledge Base" },
  { prefix: "/broadcast", title: "Broadcast" },
  { prefix: "/alerts", title: "Alerts" },
  { prefix: "/performance/kpi-entry", title: "KPI Entry" },
  { prefix: "/performance", title: "My Performance" },
  { prefix: "/surveys/", title: "Survey Capture" },
  { prefix: "/surveys", title: "Surveys" },
  { prefix: "/sync", title: "Sync Queue" },
  { prefix: "/admin/users", title: "Users & Roles" },
  { prefix: "/admin/reports", title: "Reports" },
  { prefix: "/admin/settings", title: "Settings" },
];

export const pageTitleFor = (pathname: string) => {
  if (pathname.startsWith("/visits/") && pathname.endsWith("/outcome")) return "Visit Outcome";
  if (pathname.startsWith("/farmers/") && pathname.endsWith("/services")) return "Farmer Services";
  return PAGE_TITLES.find((p) => pathname.startsWith(p.prefix))?.title ?? "Dashboard";
};
