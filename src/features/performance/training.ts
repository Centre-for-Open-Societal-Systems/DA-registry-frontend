import type { PillTone } from "@/components/ui/Pill";

// The DA's Agrilearn training record: courses, certificates and upcoming sessions (sample data, API not wired).

export type CourseStatus = "Completed" | "In progress" | "Overdue" | "Not started";
export type CourseCategory = "Digital tools" | "Agronomy" | "Safety & compliance" | "Livestock" | "Extension methods";

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  mandatory: boolean;
  provider: string;
  /** Lessons completed of the course total. */
  done: number;
  total: number;
  status: CourseStatus;
  dueDate: string;
  certificateId?: string;
  completedOn?: string;
  summary: string;
  /** Last successful Agrilearn sync, "DD Mon YYYY, HH:MM" in EAT. */
  lastSync: string;
}

export const COURSE_STATUS_TONE: Record<CourseStatus, PillTone> = { Completed: "green", "In progress": "blue", Overdue: "red", "Not started": "slate" };

export const COURSES: Course[] = [
  { id: "AL-101", title: "Fayda-linked farmer registration", category: "Digital tools", mandatory: true, provider: "Agrilearn", done: 64, total: 64, status: "Completed", dueDate: "30 Jun 2026", certificateId: "CERT-AL-101-0341", completedOn: "18 Jun 2026", summary: "Register farmers against their Fayda ID, capture consent and resolve duplicate or mismatched records before they reach the Farmer Registry.", lastSync: "07 Oct 2026, 08:30" },
  { id: "AL-104", title: "Integrated pest management basics", category: "Agronomy", mandatory: true, provider: "Agrilearn", done: 24, total: 25, status: "In progress", dueDate: "31 Oct 2026", summary: "Recognise the main crop pests and diseases of the woreda, set action thresholds and advise farmers on cultural, biological and chemical control.", lastSync: "11 Oct 2026, 17:05" },
  { id: "AL-112", title: "Field safety and agrochemical handling", category: "Safety & compliance", mandatory: true, provider: "Agrilearn", done: 23, total: 46, status: "Overdue", dueDate: "30 Sep 2026", summary: "Handle, store and apply agrochemicals safely, use protective equipment and respond to spills and poisoning in the field.", lastSync: "10 Oct 2026, 09:40" },
  { id: "AL-118", title: "Livestock vaccination calendar", category: "Livestock", mandatory: false, provider: "ATI", done: 0, total: 30, status: "Not started", dueDate: "15 Dec 2026", summary: "Plan the yearly vaccination calendar for cattle, small ruminants and poultry and coordinate campaigns with the woreda animal health team.", lastSync: "09 Oct 2026, 14:15" },
  { id: "AL-121", title: "Farmer group facilitation", category: "Extension methods", mandatory: true, provider: "Agrilearn", done: 40, total: 40, status: "Completed", dueDate: "31 Aug 2026", certificateId: "CERT-AL-121-0512", completedOn: "22 Aug 2026", summary: "Run effective farmer group and FTC sessions, manage group dynamics and follow up on adoption of advised practices.", lastSync: "07 Oct 2026, 08:30" },
  { id: "AL-125", title: "Offline sync and data quality", category: "Digital tools", mandatory: false, provider: "Agrilearn", done: 18, total: 32, status: "In progress", dueDate: "30 Nov 2026", summary: "Build reliable field-data workflows when connectivity is limited. Understand device storage, queued records and safe reconnection.", lastSync: "11 Oct 2026, 16:20" },
  { id: "AL-130", title: "Soil fertility and fertilizer advice", category: "Agronomy", mandatory: false, provider: "ATI", done: 36, total: 36, status: "Completed", dueDate: "15 Sep 2026", certificateId: "CERT-AL-130-0287", completedOn: "09 Sep 2026", summary: "Read soil test results, recommend fertilizer types and rates for the main crops and promote compost and liming where needed.", lastSync: "08 Oct 2026, 11:00" },
  { id: "AL-142", title: "Grievance handling and referral", category: "Extension methods", mandatory: true, provider: "Agrilearn", done: 5, total: 20, status: "In progress", dueDate: "15 Nov 2026", summary: "Receive farmer grievances, record them correctly, refer them to the right office and keep the farmer informed until closure.", lastSync: "12 Oct 2026, 07:50" },
];

export const coursePercent = (c: Course) => Math.round((c.done / c.total) * 100);

export type CertificateProvenance = "Agrilearn auto-sync" | "External upload";
export type CertificateStatus = "Agrilearn-auto" | "Verified" | "Pending verification";

export const CERTIFICATE_TYPES = ["Academic degree", "Professional certification", "Training completion", "Licence", "Other"] as const;
export type CertificateType = (typeof CERTIFICATE_TYPES)[number];

export interface CertificateDocument {
  name: string;
  /** e.g. "PDF • 2.1 MB • 1 page". */
  meta: string;
  /** Object URL of a file the DA picked in this session; sample records have none. */
  url?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  credentialId: string;
  provenance: CertificateProvenance;
  status: CertificateStatus;
  type: CertificateType;
  issuedOn: string;
  expiresOn?: string;
  notes?: string;
  /** External uploads only: who submitted it and who verifies it. */
  uploadedBy?: string;
  reviewOwner?: string;
  document?: CertificateDocument;
}

export const CERTIFICATE_STATUS_TONE: Record<CertificateStatus, PillTone> = { "Agrilearn-auto": "blue", Verified: "green", "Pending verification": "amber" };

export const PROVENANCE_NOTE: Record<CertificateProvenance, string> = { "Agrilearn auto-sync": "Read-only earned record", "External upload": "DA-submitted record" };

/** Counted as held: synced from Agrilearn or verified by the Woreda. */
export const isEarnedCertificate = (c: Certificate) => c.status !== "Pending verification";

const DA_NAME = "Abebe Kebede";
export const REVIEW_OWNER = "Bako Tibe Woreda Extension Supervisor";

const agrilearn = (credentialId: string, name: string, issuedOn: string, expiresOn: string): Certificate => ({
  id: credentialId,
  name,
  issuer: "Agrilearn",
  credentialId,
  provenance: "Agrilearn auto-sync",
  status: "Agrilearn-auto",
  type: "Training completion",
  issuedOn,
  expiresOn,
  document: { name: `${credentialId.toLowerCase()}.pdf`, meta: "PDF • 184 KB • 1 page" },
});

export const CERTIFICATES: Certificate[] = [
  agrilearn("CERT-AL-101-0341", "Fayda-linked farmer registration", "18 Jun 2026", "18 Jun 2028"),
  agrilearn("CERT-AL-121-0512", "Farmer group facilitation", "22 Aug 2026", "22 Aug 2028"),
  agrilearn("CERT-AL-130-0287", "Soil fertility and fertilizer advice", "09 Sep 2026", "09 Sep 2028"),
  agrilearn("CERT-AL-087-0196", "Climate-smart agriculture", "14 Nov 2025", "14 Nov 2027"),
  agrilearn("CERT-AL-064-0121", "Small-scale irrigation basics", "20 Jun 2025", "20 Jun 2027"),
  { id: "EXT-0001", name: "Integrated pest management", issuer: "Ambo Agricultural TVET College", credentialId: "AMBO-IPM-2026-118", provenance: "External upload", status: "Pending verification", type: "Training completion", issuedOn: "28 Sep 2026", notes: "Practical training in pest identification and integrated control methods.", uploadedBy: DA_NAME, reviewOwner: REVIEW_OWNER, document: { name: "ambo-agricultural-tvet-college.pdf", meta: "PDF • 2.1 MB • 1 page" } },
  { id: "EXT-0002", name: "Drip irrigation design", issuer: "Jimma University", credentialId: "JU-DID-2026-0094", provenance: "External upload", status: "Pending verification", type: "Professional certification", issuedOn: "02 Oct 2026", uploadedBy: DA_NAME, reviewOwner: REVIEW_OWNER, document: { name: "jimma-drip-irrigation.pdf", meta: "PDF • 1.4 MB • 2 pages" } },
  { id: "EXT-0003", name: "Diploma in Plant Science", issuer: "Ambo Agricultural TVET College", credentialId: "AMBO-DIP-2019-0457", provenance: "External upload", status: "Verified", type: "Academic degree", issuedOn: "15 Jul 2019", uploadedBy: DA_NAME, reviewOwner: REVIEW_OWNER, document: { name: "plant-science-diploma.pdf", meta: "PDF • 3.2 MB • 2 pages" } },
  { id: "EXT-0004", name: "Pesticide applicator licence", issuer: "Oromia Bureau of Agriculture", credentialId: "OBOA-PAL-2024-0871", provenance: "External upload", status: "Verified", type: "Licence", issuedOn: "03 Apr 2024", expiresOn: "03 Apr 2027", uploadedBy: DA_NAME, reviewOwner: REVIEW_OWNER, document: { name: "pesticide-applicator-licence.jpg", meta: "JPG • 860 KB • 1 page" } },
  { id: "EXT-0005", name: "First aid for field staff", issuer: "Ethiopian Red Cross Society", credentialId: "ERCS-FA-2025-3312", provenance: "External upload", status: "Verified", type: "Training completion", issuedOn: "12 Feb 2025", expiresOn: "12 Feb 2027", notes: "Two-day first aid course for extension staff.", uploadedBy: DA_NAME, reviewOwner: REVIEW_OWNER, document: { name: "first-aid-certificate.pdf", meta: "PDF • 640 KB • 1 page" } },
];

export interface TrainingSession {
  id: string;
  title: string;
  /** ISO date, e.g. "2026-10-16". */
  date: string;
  time: string;
  mode: "In-person" | "Online";
  venue: string;
  course?: string;
  seats: number;
  seatsTaken: number;
}

/** Sessions in the next 90 days, in date order. */
export const UPCOMING_SESSIONS: TrainingSession[] = [
  { id: "S-301", title: "IPM field demonstration", date: "2026-10-16", time: "09:00–12:00", mode: "In-person", venue: "Bako Agricultural Research Centre", course: "AL-104", seats: 25, seatsTaken: 22 },
  { id: "S-302", title: "Agrochemical handling make-up session", date: "2026-10-22", time: "14:00–16:00", mode: "Online", venue: "Agrilearn live room", course: "AL-112", seats: 60, seatsTaken: 38 },
  { id: "S-303", title: "Grievance referral workshop", date: "2026-11-05", time: "08:30–16:00", mode: "In-person", venue: "Bako Tibe woreda office", course: "AL-142", seats: 30, seatsTaken: 30 },
  { id: "S-304", title: "Offline sync clinic", date: "2026-11-19", time: "10:00–11:30", mode: "Online", venue: "Agrilearn live room", course: "AL-125", seats: 100, seatsTaken: 41 },
  { id: "S-305", title: "Livestock vaccination refresher", date: "2026-12-03", time: "09:00–15:00", mode: "In-person", venue: "Ambo ATVET demo plot", course: "AL-118", seats: 40, seatsTaken: 12 },
  { id: "S-306", title: "Quarterly DA coaching day", date: "2027-01-08", time: "09:00–16:00", mode: "In-person", venue: "Bako Tibe woreda office", seats: 50, seatsTaken: 27 },
];

export interface IncentiveCriterion {
  title: string;
  detail: string;
  met: boolean;
}

export const INCENTIVE_CRITERIA: IncentiveCriterion[] = [
  { title: "Mandatory training ≥ 80%", detail: "All mandatory Agrilearn courses completed within the period, or at least 80% with none overdue > 30 days.", met: false },
  { title: "KPI scorecard ≥ 70", detail: "Weighted KPI score for the quarter (FR-09e weights 30/25/20/15/10).", met: true },
  { title: "Visit cadence SLA met", detail: "Planned farmer visits completed on schedule (FR-09c).", met: true },
  { title: "Active status all period", detail: "No unapproved absence; approved leave does not disqualify.", met: true },
];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);

/** Second half of the course status line on the course page. */
export const courseStatusNote = (c: Course) =>
  ({
    Completed: c.certificateId ? "certificate issued" : "awaiting certificate",
    "In progress": `${c.done} of ${c.total} lessons`,
    Overdue: `due date ${c.dueDate} passed`,
    "Not started": "not opened in Agrilearn yet",
  })[c.status];

/** Agrilearn learner portal. Placeholder until the real Agrilearn address is confirmed. */
export const AGRILEARN_URL = "https://agrilearn.example.org";
