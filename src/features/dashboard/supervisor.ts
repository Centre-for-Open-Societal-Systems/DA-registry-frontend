import type { PillTone } from "@/components/ui/Pill";

// Supervisor (Woreda) programme-health dashboard — kebele-level roll-ups (FR-09a scope, Part 1 read-only view).

export type KebeleStatus = "On track" | "Watch" | "At risk";

export interface KebeleRow {
  kebele: string;
  farmers: number;
  agents: number;
  visitPct: number;
  lastSync: string;
  status: KebeleStatus;
}

export interface WoredaHealth {
  woreda: string;
  updatedAt: string;
  stats: { farmers: number; activeAgents: number; dataQuality: number; openGrievances: number };
  kebeles: KebeleRow[];
}

export const STATUS_TONE: Record<KebeleStatus, PillTone> = { "On track": "green", Watch: "amber", "At risk": "red" };

/** Visit % thresholds drive status: ≥ 80 On track · 60–79 Watch · < 60 At risk. */
export const statusFor = (visitPct: number): KebeleStatus => (visitPct >= 80 ? "On track" : visitPct >= 60 ? "Watch" : "At risk");

const row = (kebele: string, farmers: number, agents: number, visitPct: number, lastSync: string): KebeleRow => ({ kebele, farmers, agents, visitPct, lastSync, status: statusFor(visitPct) });

export const WOREDA_HEALTH: WoredaHealth[] = [
  {
    woreda: "Adea Woreda",
    updatedAt: "15 Sept 2026",
    stats: { farmers: 12_490, activeAgents: 22, dataQuality: 84, openGrievances: 22 },
    kebeles: [
      row("Akaki Center", 1_560, 3, 89, "24 Sep 2026, 14:30"),
      row("Gofa", 1_370, 3, 85, "24 Sep 2026, 14:00"),
      row("Kaliti", 980, 1, 51, "24 Sep 2026, 12:00"),
      row("Kotebe", 1_240, 2, 74, "24 Sep 2026, 13:00"),
      row("Lafto", 1_450, 3, 92, "24 Sep 2026, 14:45"),
      row("Nifas Silk", 890, 1, 48, "24 Sep 2026, 10:00"),
      row("Bole", 2_100, 4, 81, "24 Sep 2026, 14:15"),
      row("Yeka", 1_680, 3, 72, "24 Sep 2026, 13:00"),
      row("Arada", 760, 1, 63, "24 Sep 2026, 11:00"),
      row("Gulele", 1_120, 2, 44, "24 Sep 2026, 09:00"),
      row("Kolfe", 1_340, 2, 86, "24 Sep 2026, 14:20"),
      row("Lideta", 1_010, 2, 67, "24 Sep 2026, 12:40"),
    ],
  },
  {
    woreda: "Akaki Woreda",
    updatedAt: "15 Sept 2026",
    stats: { farmers: 8_210, activeAgents: 15, dataQuality: 79, openGrievances: 14 },
    kebeles: [
      row("Akaki 01", 1_420, 3, 86, "24 Sep 2026, 14:15"),
      row("Akaki 02", 1_180, 2, 77, "24 Sep 2026, 13:00"),
      row("Dalota", 1_320, 3, 91, "24 Sep 2026, 14:40"),
      row("Gelan", 1_510, 3, 68, "24 Sep 2026, 12:00"),
      row("Tulu Dimtu", 1_440, 2, 58, "24 Sep 2026, 10:00"),
      row("Koye", 1_340, 2, 81, "24 Sep 2026, 14:00"),
    ],
  },
  {
    woreda: "Gimbichu Woreda",
    updatedAt: "14 Sept 2026",
    stats: { farmers: 6_730, activeAgents: 11, dataQuality: 88, openGrievances: 7 },
    kebeles: [
      row("Chefe Donsa", 1_480, 3, 93, "24 Sep 2026, 14:50"),
      row("Adulala", 1_260, 2, 85, "24 Sep 2026, 14:00"),
      row("Dire", 1_390, 2, 72, "24 Sep 2026, 13:00"),
      row("Kilinto", 1_310, 2, 88, "24 Sep 2026, 14:20"),
      row("Wachu", 1_290, 2, 55, "24 Sep 2026, 09:00"),
    ],
  },
];
