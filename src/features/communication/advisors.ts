import type { PillTone } from "@/components/ui/Pill";

// MoA subject-matter experts a DA can reference for specialist advisory support.
// A reference directory only — not an HR record of MoA staff.

export type AdvisorStatus = "Active" | "On leave" | "Inactive";

export const EXPERTISE_AREAS = ["Crop protection", "Soil fertility", "Livestock health", "Irrigation", "Horticulture", "Agronomy", "Natural resources", "Agri-finance"] as const;
export type ExpertiseArea = (typeof EXPERTISE_AREAS)[number];

export const ADVISOR_REGIONS = ["Oromia", "Amhara", "Sidama", "Tigray", "SNNP"] as const;

export interface Advisor {
  id: string;
  name: string;
  expertise: ExpertiseArea;
  unit: string;
  region: string;
  woreda: string;
  phone: string;
  email: string;
  status: AdvisorStatus;
  /** "DD Mon YYYY, HH:MM" in EAT. */
  updatedAt: string;
  availability: string;
}

export const ADVISOR_STATUS_TONE: Record<AdvisorStatus, PillTone> = { Active: "green", "On leave": "amber", Inactive: "red" };

export const ADVISORS: Advisor[] = [
  { id: "ADV-0101", name: "Dr. Alemayehu Bekele", expertise: "Crop protection", unit: "Plant Protection Directorate", region: "Oromia", woreda: "Bako Tibe", phone: "+251 91 120 4410", email: "alemayehu.b@moa.gov.et", status: "Active", updatedAt: "12 Sep 2026, 08:30", availability: "Mon–Fri, 08:30–17:00" },
  { id: "ADV-0102", name: "Tsehay Wondimu", expertise: "Soil fertility", unit: "Crop Development Directorate", region: "Oromia", woreda: "Bako Tibe", phone: "+251 91 338 7021", email: "tsehay.w@moa.gov.et", status: "On leave", updatedAt: "09 Sep 2026, 16:45", availability: "Back 30 Oct 2026" },
  { id: "ADV-0103", name: "Dr. Getachew Tolera", expertise: "Livestock health", unit: "Animal Health Directorate", region: "Oromia", woreda: "Ambo", phone: "+251 91 245 6630", email: "getachew.t@moa.gov.et", status: "Active", updatedAt: "11 Sep 2026, 10:15", availability: "Mon–Fri, 08:30–17:00" },
  { id: "ADV-0104", name: "Meseret Haile", expertise: "Irrigation", unit: "Small-scale Irrigation Directorate", region: "Amhara", woreda: "Bahir Dar Zuria", phone: "+251 91 402 1187", email: "meseret.h@moa.gov.et", status: "Active", updatedAt: "10 Sep 2026, 14:20", availability: "Tue & Thu, 09:00–16:00" },
  { id: "ADV-0105", name: "Bekele Gutema", expertise: "Horticulture", unit: "Horticulture Development Directorate", region: "Oromia", woreda: "Jimma Arjo", phone: "+251 91 517 3394", email: "bekele.g@moa.gov.et", status: "Inactive", updatedAt: "02 Sep 2026, 09:05", availability: "Not taking requests" },
  { id: "ADV-0106", name: "Dr. Hanna Girma", expertise: "Agronomy", unit: "Crop Development Directorate", region: "Sidama", woreda: "Hawassa Zuria", phone: "+251 91 623 0458", email: "hanna.g@moa.gov.et", status: "Active", updatedAt: "08 Sep 2026, 11:40", availability: "Mon–Fri, 08:30–17:00" },
  { id: "ADV-0107", name: "Yohannes Kebede", expertise: "Natural resources", unit: "Natural Resources Management Directorate", region: "Tigray", woreda: "Enderta", phone: "+251 91 734 2269", email: "yohannes.k@moa.gov.et", status: "Active", updatedAt: "07 Sep 2026, 15:10", availability: "Mon–Wed, 09:00–15:00" },
  { id: "ADV-0108", name: "Selamawit Tadesse", expertise: "Agri-finance", unit: "Agricultural Marketing Directorate", region: "Amhara", woreda: "Dessie Zuria", phone: "+251 91 845 9902", email: "selamawit.t@moa.gov.et", status: "On leave", updatedAt: "05 Sep 2026, 13:25", availability: "Back 18 Oct 2026" },
  { id: "ADV-0109", name: "Dr. Mulugeta Abebe", expertise: "Livestock health", unit: "Animal Health Directorate", region: "SNNP", woreda: "Wolaita Sodo", phone: "+251 91 956 1173", email: "mulugeta.a@moa.gov.et", status: "Active", updatedAt: "06 Sep 2026, 08:55", availability: "Mon–Fri, 08:30–17:00" },
  { id: "ADV-0110", name: "Lensa Dinka", expertise: "Crop protection", unit: "Plant Protection Directorate", region: "Oromia", woreda: "Gimbi", phone: "+251 91 067 4425", email: "lensa.d@moa.gov.et", status: "Inactive", updatedAt: "01 Sep 2026, 17:30", availability: "Not taking requests" },
  { id: "ADV-0111", name: "Abebe Worku", expertise: "Soil fertility", unit: "Soil Resources Directorate", region: "Amhara", woreda: "Debre Markos", phone: "+251 91 178 3356", email: "abebe.w@moa.gov.et", status: "Active", updatedAt: "04 Sep 2026, 12:00", availability: "Wed & Fri, 09:00–16:00" },
  { id: "ADV-0112", name: "Fikirte Alemu", expertise: "Irrigation", unit: "Small-scale Irrigation Directorate", region: "Oromia", woreda: "Bako Tibe", phone: "+251 91 289 6617", email: "fikirte.a@moa.gov.et", status: "Active", updatedAt: "03 Sep 2026, 09:50", availability: "Mon–Fri, 08:30–17:00" },
];

export const getAdvisor = (id: string) => ADVISORS.find((a) => a.id === id);

/** Date part of `updatedAt` for compact table cells. */
export const advisorUpdatedDate = (a: Advisor) => a.updatedAt.split(",")[0];

/** Second half of the "Directory status" line on the advisor page. */
export const advisorStatusNote = (a: Advisor) => (a.status === "Active" ? "available in directory" : a.availability.toLowerCase());
