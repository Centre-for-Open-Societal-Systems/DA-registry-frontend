import type { PillTone } from "@/components/ui/Pill";
import { FARMERS } from "@/features/farmers";

// Rule-based beneficiary segments (Appendix C.3). Rules are edited by Supervisor/Admin only (Appendix D row 1).
export interface Segment {
  id: string;
  name: string;
  rule: string;
  scheme: string;
  members: number;
  tone: PillTone;
  icon: "leaf" | "cash" | "drop" | "people";
}

export const SEGMENTS: Segment[] = [
  { id: "seg-input", name: "Input subsidy — teff & wheat", rule: "primary crop ∈ {Teff, Wheat} AND land ≥ 0.5 ha", scheme: "MoA input voucher 2026/27", members: 142, tone: "green", icon: "leaf" },
  { id: "seg-credit", name: "Credit-eligible smallholders", rule: "Fayda verified AND no open credit application", scheme: "Access to Credit (partner banks)", members: 123, tone: "blue", icon: "cash" },
  { id: "seg-drought", name: "Drought-response kebeles", rule: "kebele ∈ {Gedo, Adea}", scheme: "Emergency seed distribution", members: 118, tone: "amber", icon: "drop" },
  { id: "seg-women", name: "Women-headed households", rule: "household head = female", scheme: "Livelihood grant (ATI)", members: 64, tone: "purple", icon: "people" },
];

export const segmentName = (id: string) => SEGMENTS.find((s) => s.id === id)?.name ?? id;

export type BeneficiaryStatus = "Enrolled" | "Pending verification" | "Removed";

export interface Beneficiary {
  avatar?: string;
  id: string;
  name: string;
  kebele: string;
  crop: string;
  segmentId: string;
  status: BeneficiaryStatus;
  linkedAt: string;
}

// Each farmer's segment follows the segment rules above; farmers not yet Fayda-verified stay pending.
const LINKS: Record<string, Pick<Beneficiary, "segmentId" | "status" | "linkedAt">> = {
  "lelise-gudeta": { segmentId: "seg-input", status: "Enrolled", linkedAt: "22 Sep 2026" },
  "abebe-kebede": { segmentId: "seg-drought", status: "Pending verification", linkedAt: "21 Sep 2026" },
  "chaltu-dinkesa": { segmentId: "seg-women", status: "Enrolled", linkedAt: "19 Sep 2026" },
  "tadesse-alemu": { segmentId: "seg-input", status: "Pending verification", linkedAt: "16 Sep 2026" },
  "meseret-tolera": { segmentId: "seg-credit", status: "Enrolled", linkedAt: "13 Sep 2026" },
  "gemechu-bekele": { segmentId: "seg-drought", status: "Enrolled", linkedAt: "09 Sep 2026" },
  "hirut-fikadu": { segmentId: "seg-women", status: "Pending verification", linkedAt: "02 Sep 2026" },
  "kedir-mohammed": { segmentId: "seg-credit", status: "Enrolled", linkedAt: "28 Aug 2026" },
  "tigist-worku": { segmentId: "seg-input", status: "Enrolled", linkedAt: "21 Aug 2026" },
  "dawit-negash": { segmentId: "seg-input", status: "Pending verification", linkedAt: "14 Aug 2026" },
};

export const SEED_BENEFICIARIES: Beneficiary[] = FARMERS.filter((f) => LINKS[f.id]).map((f) => ({
  id: f.id,
  name: f.name,
  avatar: f.avatar,
  kebele: f.kebele,
  crop: f.crop,
  ...LINKS[f.id],
}));
