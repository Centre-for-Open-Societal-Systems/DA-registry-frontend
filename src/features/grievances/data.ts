import type { FilterFieldConfig } from "@/components/ui/AdvancedFiltersDrawer";
import type { FilterOption } from "@/components/ui/FilterDropdown";
import type {
  Grievance,
  GrievanceBucket,
  GrievanceCase,
  GrievanceCategory,
  GrievancePriority,
  GrievanceStatus,
  ThreadMessage,
} from "./types";

// Sample records until the Grievance Service API is wired through src/proxy.ts.
// The base set mirrors the design; the rest is generated so paging/filters have data to work on.
type Template = Omit<Grievance, "ticketId" | "submittedAt" | "attachments" | "responses" | "raisedBy">;

const TEMPLATES: Template[] = [
  { title: "Fertiliser allocation delivered 6 weeks late, crop season missed", submitter: "Jijiga Woreda Agriculture Office", region: "Somali", woreda: "Jijiga", type: "Fertilizer non-delivery or shortage", category: "Input", status: "Assigned", priority: "High" },
  { title: "PSNP safety net scheme payment not disbursed for Q1 2026", submitter: "Almaz Worku", region: "Oromia", woreda: "Sebeta", type: "Government scheme benefit not received", category: "Schemes", status: "Submitted", priority: "High" },
  { title: "Teff produce payment overdue by 45 days", submitter: "Debrezion Farmers Cooperative", region: "Amhara", woreda: "Bahir Dar Zuria", type: "Payment delay (>SLA)", category: "Payments", status: "Pending Submit", priority: "Critical" },
  { title: "Certified maize seed supplied with poor germination rate", submitter: "Abebe Bekele", region: "Oromia", woreda: "Bishoftu", type: "Seed quality / germination failure", category: "Inputs", status: "In Progress", priority: "High" },
  { title: "PSNP safety net scheme payment not disbursed for Q1 2026", submitter: "Almaz Worku", region: "Oromia", woreda: "Sebeta", type: "Government scheme benefit not received", category: "Markets", status: "More Info Needed", priority: "Medium" },
  { title: "Weighing scale irregularity at Nekemte grain market", submitter: "Nekemte Traders Association", region: "Oromia", woreda: "Nekemte", type: "Market malpractice", category: "Markets", status: "Under Review", priority: "Medium" },
  { title: "Extension agent visit not conducted for two consecutive months", submitter: "Hana Alemu", region: "SNNPR", woreda: "Dale", type: "Extension service gap", category: "Extension", status: "Resolved", priority: "Low" },
  { title: "Boundary dispute over irrigated plot near Koka reservoir", submitter: "Kebele 02 Farmers Group", region: "Oromia", woreda: "Lume", type: "Land / plot dispute", category: "Land", status: "Rejected", priority: "Medium" },
  { title: "Pesticide batch expired before distribution", submitter: "Adama Input Dealer", region: "Oromia", woreda: "Adama", type: "Input quality complaint", category: "Inputs", status: "Resolved", priority: "High" },
  { title: "Cooperative dividend payment miscalculated", submitter: "Fogera Rice Cooperative", region: "Amhara", woreda: "Fogera", type: "Payment discrepancy", category: "Payments", status: "In Progress", priority: "Medium" },
];

// Distribution across the 42 records: Pending 12 · In Progress 8 · Under Review 6 · Resolved 12 · Rejected 4
const STATUS_SEQUENCE: GrievanceStatus[] = [
  ...Array<GrievanceStatus>(4).fill("Submitted"),
  ...Array<GrievanceStatus>(4).fill("Pending Submit"),
  ...Array<GrievanceStatus>(4).fill("More Info Needed"),
  ...Array<GrievanceStatus>(4).fill("Assigned"),
  ...Array<GrievanceStatus>(4).fill("In Progress"),
  ...Array<GrievanceStatus>(6).fill("Under Review"),
  ...Array<GrievanceStatus>(12).fill("Resolved"),
  ...Array<GrievanceStatus>(4).fill("Rejected"),
];

const REGION_CODES: Record<string, string> = { Somali: "SOMA", Oromia: "OROM", Amhara: "AMHA", SNNPR: "SNNP" };
const CATEGORY_CODES: Record<GrievanceCategory, string> = {
  Input: "INP", Inputs: "INP", Schemes: "SCH", Payments: "PAY", Markets: "MKT", Extension: "EXT", Land: "LND",
};

const SUBMITTED_DATES = ["May 28, 2026, 10:42 AM", "May 27, 2026, 4:15 PM", "May 26, 2026, 9:03 AM", "May 24, 2026, 1:30 PM", "May 21, 2026, 11:20 AM"];

export const TOTAL_GRIEVANCES = 42;

export const GRIEVANCES: Grievance[] = Array.from({ length: TOTAL_GRIEVANCES }, (_, i) => {
  const t = TEMPLATES[i % TEMPLATES.length];
  // First five rows keep the design's statuses; the rest follow the fixed distribution
  const status = i < 5 ? t.status : STATUS_SEQUENCE[i];
  const woredaCode = t.woreda.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
  return {
    ...t,
    status,
    // Every third record was raised by the DA (own or on behalf of a farmer)
    raisedBy: i % 3 === 0 ? "DA" : "Farmer",
    ticketId: `${REGION_CODES[t.region]}-${woredaCode}-${CATEGORY_CODES[t.category]}-${String(9900 + i).padStart(5, "0")}`,
    submittedAt: SUBMITTED_DATES[Math.floor(i / 5) % SUBMITTED_DATES.length],
    attachments: (i % 4) + 1,
    responses: i % 3 === 0 ? 0 : 1,
  };
});

export function bucketOf(status: GrievanceStatus): GrievanceBucket {
  switch (status) {
    case "Pending Submit":
    case "Submitted":
    case "More Info Needed":
    case "Pending Submitter":
      return "Pending";
    case "Assigned":
    case "In Progress":
      return "In Progress";
    case "Closed":
      return "Resolved";
    default:
      return status;
  }
}

export const GRIEVANCE_STATS: Record<"All" | GrievanceBucket, number> = GRIEVANCES.reduce(
  (acc, g) => {
    acc.All += 1;
    acc[bucketOf(g.status)] += 1;
    return acc;
  },
  { All: 0, Pending: 0, "In Progress": 0, "Under Review": 0, Resolved: 0, Rejected: 0 },
);

function toOptions<T extends string>(values: T[]): FilterOption[] {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].map(([value, count]) => ({ value, label: value, count }));
}

export const GRIEVANCE_CATEGORY_OPTIONS = toOptions(GRIEVANCES.map((g) => g.category));
export const GRIEVANCE_STATUS_OPTIONS = toOptions(GRIEVANCES.map((g) => g.status));
export const GRIEVANCE_PRIORITY_OPTIONS: FilterOption[] = (["Critical", "High", "Medium", "Low"] as GrievancePriority[]).map((p) => ({
  value: p,
  label: p,
  count: GRIEVANCES.filter((g) => g.priority === p).length,
}));

export const GRIEVANCE_REGION_OPTIONS = toOptions(GRIEVANCES.map((g) => g.region));

export const GRIEVANCE_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "category", label: "Category", allLabel: "All categories", placeholder: "All categories", options: GRIEVANCE_CATEGORY_OPTIONS },
  { key: "status", label: "Status", allLabel: "All statuses", placeholder: "All statuses", options: GRIEVANCE_STATUS_OPTIONS },
  { key: "priority", label: "Priority", allLabel: "All priorities", placeholder: "All priorities", options: GRIEVANCE_PRIORITY_OPTIONS },
  { key: "region", label: "Region", allLabel: "All regions", placeholder: "All regions", options: GRIEVANCE_REGION_OPTIONS },
];

// ---------------------------------------------------------------------------
// Case detail (thread, submitter, SLA) — same sample thread for every record
// until the Grievance Service exposes per-ticket detail.
// ---------------------------------------------------------------------------

export const RESPONSE_TYPES = ["Partially Resolved", "Resolved", "Rejected", "Needs More Info", "Escalated"];
export const CASE_STATUSES: GrievanceStatus[] = ["Submitted", "Assigned", "In Progress", "More Info Needed", "Pending Submitter", "Resolved", "Closed"];
export const OFFICERS = ["Tigist Alemu", "Dawit Haile", "Selam Bekele", "Biruk Tesfaye", "Lemma Kassa", "Hana Girma"];
export const DEPARTMENTS = [
  "Ministry of Agriculture (MoA)",
  "Agricultural Transformation Institute (ATI)",
  "Ethiopian Agricultural Business Corporation (EABC)",
  "Cooperative Promotion Agency",
  "Agricultural Finance Institute (AFI)",
  "Inputs Supply & Distribution Agency",
  "Market Development & Trade Bureau",
  "Regional Bureau of Agriculture",
  "Woreda Agriculture & Natural Resource Office",
  "Irrigation & Lowlands Development Authority",
];

/** Senior Nodal Officers (L2) who can approve an SLA deferral. */
export interface NodalOfficer {
  name: string;
  organisation: string;
  email: string;
}

export const NODAL_OFFICERS: NodalOfficer[] = [
  { name: "Fikadu Negash", organisation: "Ministry of Agriculture (MoA)", email: "fikadu.negash@moa.gov.et" },
  { name: "Meseret Tadesse", organisation: "Agricultural Transformation Institute (ATI)", email: "meseret.tadesse@ati.gov.et" },
  { name: "Yonas Bekele", organisation: "Regional Bureau of Agriculture", email: "yonas.bekele@oromia.gov.et" },
  { name: "Almaz Girma", organisation: "Woreda Agriculture & Natural Resource Office", email: "almaz.girma@moa.gov.et" },
];

export const MAX_DEFERRAL_DAYS = 30;
export const MIN_DEFERRAL_REASON = 20;

export function buildCase(grievance: Grievance): GrievanceCase {
  const thread: ThreadMessage[] = [
    {
      kind: "submission",
      id: "m1",
      author: grievance.submitter,
      role: "Individual Farmer",
      at: "10 Apr 2026, 14:53",
      body: "I purchased 50 kg of certified maize seed from the cooperative input store in Bishoftu in March 2026. After planting, germination rate was less than 40%, causing significant crop failure on my 2-hectare plot. I raised this with the store manager but received no response.",
      attachments: ["document_1.pdf", "document_2.pdf", "document_3.pdf"],
    },
    {
      kind: "dept-response",
      id: "m2",
      author: "Tigist Alemu",
      role: "Inputs Officer",
      at: "28 Apr 2026, 19:40",
      responseNo: 1,
      outcome: "Partially Resolved",
      actionTaken: "Seed batch samples sent to National Quality Control Laboratory for testing.",
      resolutionSummary: "Investigation is ongoing. Lab results expected by 5 May 2026. Farmer's plot has been documented.",
      proposedClosure: "2026-05-10",
    },
    { kind: "status-change", id: "m3", from: "Assigned", to: "In Progress", by: "Tigist Alemu", at: "28 Apr 2026" },
    {
      kind: "internal-note",
      id: "m4",
      author: "Tigist Alemu",
      role: "Inputs Officer",
      at: "28 Apr 2026, 19:40",
      body: "Batch number recorded. Coordinating with quality lab — results in 7 days.",
    },
  ];

  return {
    grievance,
    thread,
    submitter: {
      name: grievance.submitter,
      kind: "Individual Farmer",
      faydaId: "FYD-9821-0034",
      avatar: "/images/tadesse_profile.png",
      kebele: "Kebele 01",
      channel: "Field Officer Assisted",
      submittedOn: "20 Apr 2026",
    },
    sla: { consumedPct: 100, submittedOn: "10 Jul 2026", dueOn: "14 Jul 2026" },
  };
}
