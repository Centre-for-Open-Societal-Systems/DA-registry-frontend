// Sample data for the Administrator home until the registry analytics API is wired.
import type { FilterFieldConfig } from "@/components/ui/AdvancedFiltersDrawer";
import type { FilterOption } from "@/components/ui/FilterDropdown";
import type { PillTone } from "@/components/ui/Pill";

export interface AdminStat {
  key: string;
  label: string;
  value: string;
  accent: string; // border-l-* class
  tile: string; // icon tile bg/text classes
  icon: "handshake" | "calendar" | "shield" | "alert";
}

export const ADMIN_STATS: AdminStat[] = [
  { key: "farmers", label: "Linked farmers", value: "12,490", accent: "border-l-blue-600", tile: "bg-info-tint text-blue-600", icon: "handshake" },
  { key: "visits", label: "Visits today", value: "22", accent: "border-l-violet-600", tile: "bg-violet-tint text-violet-600", icon: "calendar" },
  { key: "quality", label: "Avg. data quality", value: "84", accent: "border-l-brand-green", tile: "bg-brand-tint text-brand-green", icon: "shield" },
  { key: "accuracy", label: "Data accuracy", value: "18", accent: "border-l-danger", tile: "bg-danger-tint text-danger", icon: "alert" },
];

export interface TrendPoint {
  label: string;
  value: number;
}

export const REGISTRATIONS_TREND: TrendPoint[] = [
  { label: "Jan 2024", value: 460 },
  { label: "Feb 2024", value: 540 },
  { label: "Mar 2024", value: 420 },
  { label: "Apr 2024", value: 630 },
  { label: "May 2024", value: 510 },
  { label: "Jun 2024", value: 740 },
];

export type ActivityTone = "green" | "blue" | "purple" | "amber";

export interface ActivityItem {
  id: string;
  initials: string;
  tone: ActivityTone;
  title: string;
  place: string;
  at: string;
}

export const RECENT_ACTIVITY: ActivityItem[] = [
  { id: "a1", initials: "LG", tone: "green", title: "Lelise Gudeta registered as new farmer", place: "Bako Tibe", at: "10 min ago" },
  { id: "a2", initials: "AK", tone: "blue", title: "Profile updated: Abebe Kebede", place: "Adama Sector", at: "25 min ago" },
  { id: "a3", initials: "LG", tone: "purple", title: "Visit completed: Lelise Gudeta · Bako Tibe", place: "Gedo", at: "1 hr ago" },
  { id: "a4", initials: "CD", tone: "amber", title: "Kebele reassigned: Chaltu Dinkesa → Dendi", place: "Adama Sector", at: "2 hr ago" },
  { id: "a5", initials: "LG", tone: "green", title: "Lelise Gudeta registered as new farmer", place: "Bako Tibe", at: "10 min ago" },
];

export type RegistrationStatus = "Pending" | "Requires review";

export const REGISTRATION_STATUS_TONE: Record<RegistrationStatus, PillTone> = {
  Pending: "amber",
  "Requires review": "red",
};

export interface PendingRegistration {
  id: string;
  agent: string;
  type: "Farmer" | "Transporter" | "Vendor";
  kebele: string;
  updatedAt: string;
  status: RegistrationStatus;
}

export const PENDING_REGISTRATIONS: PendingRegistration[] = [
  { id: "r1", agent: "Almaz W.", type: "Farmer", kebele: "Lume", updatedAt: "May 12, 2026", status: "Pending" },
  { id: "r2", agent: "Almaz W.", type: "Transporter", kebele: "Dendi", updatedAt: "May 12, 2026", status: "Requires review" },
  { id: "r3", agent: "Bekele N.", type: "Vendor", kebele: "Bako Tibe", updatedAt: "May 12, 2026", status: "Pending" },
  { id: "r4", agent: "Chaltu D.", type: "Transporter", kebele: "Abele", updatedAt: "May 12, 2026", status: "Pending" },
];

const optionsFor = (pick: (row: PendingRegistration) => string): FilterOption[] => {
  const counts = new Map<string, number>();
  PENDING_REGISTRATIONS.forEach((row) => counts.set(pick(row), (counts.get(pick(row)) ?? 0) + 1));
  return [...counts].map(([value, count]) => ({ value, label: value, count }));
};

export const REGISTRATION_AGENT_OPTIONS = optionsFor((r) => r.agent);
export const REGISTRATION_TYPE_OPTIONS = optionsFor((r) => r.type);
export const REGISTRATION_KEBELE_OPTIONS = optionsFor((r) => r.kebele);
export const REGISTRATION_STATUS_OPTIONS = optionsFor((r) => r.status);

export const REGISTRATION_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "agent", label: "Agent", allLabel: "All agents", placeholder: "All agents", options: REGISTRATION_AGENT_OPTIONS },
  { key: "type", label: "Type", allLabel: "All types", placeholder: "All types", options: REGISTRATION_TYPE_OPTIONS },
  { key: "kebele", label: "Kebele", allLabel: "All kebeles", placeholder: "All kebeles", options: REGISTRATION_KEBELE_OPTIONS },
  { key: "status", label: "Status", allLabel: "All Status", placeholder: "All Status", options: REGISTRATION_STATUS_OPTIONS },
];
