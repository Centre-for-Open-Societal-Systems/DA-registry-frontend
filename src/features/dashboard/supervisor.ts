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
      row("Akaki Center", 1_560, 3, 74, "3h ago"),
      row("Gofa", 1_370, 3, 89, "30m ago"),
      row("Kality", 980, 1, 51, "3h ago"),
      row("Kotebe", 1_560, 3, 74, "3h ago"),
      row("Lafto", 1_370, 3, 89, "30m ago"),
      row("Nifas Silk", 980, 1, 51, "3h ago"),
      row("Bole Bulbula", 1_620, 3, 92, "15m ago"),
      row("Dukem Gebeya", 1_050, 2, 83, "1h ago"),
    ],
  },
  {
    woreda: "Akaki Woreda",
    updatedAt: "15 Sept 2026",
    stats: { farmers: 8_210, activeAgents: 15, dataQuality: 79, openGrievances: 14 },
    kebeles: [
      row("Akaki 01", 1_420, 3, 86, "45m ago"),
      row("Akaki 02", 1_180, 2, 77, "2h ago"),
      row("Dalota", 1_320, 3, 91, "20m ago"),
      row("Gelan", 1_510, 3, 68, "3h ago"),
      row("Tulu Dimtu", 1_440, 2, 58, "5h ago"),
      row("Koye", 1_340, 2, 81, "1h ago"),
    ],
  },
  {
    woreda: "Gimbichu Woreda",
    updatedAt: "14 Sept 2026",
    stats: { farmers: 6_730, activeAgents: 11, dataQuality: 88, openGrievances: 7 },
    kebeles: [
      row("Chefe Donsa", 1_480, 3, 93, "10m ago"),
      row("Adulala", 1_260, 2, 85, "1h ago"),
      row("Dire", 1_390, 2, 72, "2h ago"),
      row("Kilinto", 1_310, 2, 88, "40m ago"),
      row("Wachu", 1_290, 2, 55, "6h ago"),
    ],
  },
];
