import type { AdvisoryNote, CropRecord, Farmer, FarmerDocument, Plot, Visit } from "./types";

export const TOTAL_FARMERS = 1284;

// Tab strip shared by the Farmers and Visits pages.
export const FARMER_PAGE_TABS = [
  { label: "My Farmers", href: "/farmers" },
  { label: "Visits", href: "/visits" },
  { label: "Assignments", href: "/assignments" },
];

// The signed-in development agent (no auth backend yet).
export const CURRENT_AGENT = { name: "Tadesse Alemu", avatar: "/images/tadesse_profile.png" };

const FARMER_RECORDS: Omit<Farmer, "id">[] = [
  { name: "Lelise Gudeta", email: "lelise.gudeta@gmail.com", phone: "+251 91 246 3157", kebele: "Bako Tibe", woreda: "Bako Tibe woreda", region: "Oromia", crop: "Teff", landHa: 1.2, registeredAt: "12 May 2026", registeredTime: "08:20", status: "Verified", totalPlots: 2, visits: 9, lastVisit: "12 Jun 2026" },
  { name: "Abebe Kebede", email: "abebe.kebede@gmail.com", phone: "+251 91 555 0192", kebele: "Gedo", woreda: "Chelia woreda", region: "Oromia", crop: "Maize", landHa: 0.8, registeredAt: "03 Apr 2026", registeredTime: "09:45", status: "Pending", statusReason: "Fayda verification pending — OTP not yet confirmed by the farmer. Record is on the Farmer Registry review queue.", totalPlots: 1, visits: 4, lastVisit: "02 May 2026" },
  { name: "Chaltu Dinkesa", email: "chaltu.dinkesa@gmail.com", phone: "+251 92 118 7734", kebele: "Lume", woreda: "Lume woreda", region: "Oromia", crop: "Wheat", landHa: 1.5, registeredAt: "21 Jan 2026", registeredTime: "10:15", status: "Verified", totalPlots: 3, visits: 11, lastVisit: "20 Jun 2026" },
  { name: "Tadesse Alemu", email: "tadesse.alemu@gmail.com", phone: "+251 91 800 2210", avatar: "/images/tadesse_profile.png", kebele: "Dendi", woreda: "Dendi woreda", region: "Oromia", crop: "Teff", landHa: 2.1, registeredAt: "15 Feb 2026", registeredTime: "11:30", status: "Flagged", statusReason: "Possible duplicate — Fayda ID matches an existing record in Dendi woreda. Needs merge/keep decision in the Farmer Registry.", totalPlots: 2, visits: 6, lastVisit: "30 May 2026" },
  { name: "Meseret Tolera", email: "meseret.tolera@gmail.com", phone: "+251 93 412 6650", kebele: "Bako Tibe", woreda: "Bako Tibe woreda", region: "Oromia", crop: "Maize", landHa: 1.0, registeredAt: "08 Mar 2026", registeredTime: "14:05", status: "Verified", totalPlots: 2, visits: 7, lastVisit: "18 Jun 2026" },
  { name: "Gemechu Bekele", email: "gemechu.bekele@gmail.com", phone: "+251 91 677 3021", kebele: "Adea", woreda: "Adea woreda", region: "Oromia", crop: "Haricot bean", landHa: 0.6, registeredAt: "27 Feb 2026", registeredTime: "09:10", status: "Verified", totalPlots: 1, visits: 5, lastVisit: "09 Jun 2026" },
  { name: "Hirut Fikadu", email: "hirut.fikadu@gmail.com", phone: "+251 92 305 8847", kebele: "Gedo", woreda: "Chelia woreda", region: "Oromia", crop: "Barley", landHa: 0.9, registeredAt: "14 Apr 2026", registeredTime: "15:40", status: "Pending", statusReason: "Land certificate upload pending — awaiting scan of the Level 2 holding certificate.", totalPlots: 1, visits: 2, lastVisit: "28 May 2026" },
  { name: "Kedir Mohammed", email: "kedir.mohammed@gmail.com", phone: "+251 94 220 1593", kebele: "Adea", woreda: "Adea woreda", region: "Oromia", crop: "Chili pepper", landHa: 0.5, registeredAt: "02 Feb 2026", registeredTime: "10:50", status: "Verified", totalPlots: 1, visits: 8, lastVisit: "15 Jun 2026" },
  { name: "Tigist Worku", email: "tigist.worku@gmail.com", phone: "+251 91 948 7206", kebele: "Lume", woreda: "Lume woreda", region: "Oromia", crop: "Teff", landHa: 1.7, registeredAt: "19 Mar 2026", registeredTime: "13:25", status: "Verified", totalPlots: 2, visits: 6, lastVisit: "11 Jun 2026" },
  { name: "Dawit Negash", email: "dawit.negash@gmail.com", phone: "+251 93 761 4418", kebele: "Dendi", woreda: "Dendi woreda", region: "Oromia", crop: "Wheat", landHa: 1.3, registeredAt: "05 May 2026", registeredTime: "16:00", status: "Flagged", statusReason: "Phone number already linked to another farmer record — confirm the correct owner before approval.", totalPlots: 2, visits: 3, lastVisit: "04 Jun 2026" },
];

// Each farmer appears once; ids are derived from the name.
export const FARMERS: Farmer[] = FARMER_RECORDS.map((farmer) => ({
  ...farmer,
  id: farmer.name.toLowerCase().replace(/\s+/g, "-"),
}));

export const PLOTS: Plot[] = [
  { code: "Plot 04", crop: "Teff", areaHa: 1.8, soil: "Vertisol soil", zone: "Central Zone", lat: 9.1182, lng: 37.0564, tenure: "Certified holding (Level 2)" },
  { code: "Plot 07", crop: "Maize", areaHa: 1.4, soil: "Nitisol soil", zone: "North Hillside", lat: 9.1243, lng: 37.0521, tenure: "Certified holding (Level 2)" },
  { code: "Plot 11", crop: "Chickpea", areaHa: 0.6, soil: "Cambisol soil", zone: "East Ridge", lat: 9.1159, lng: 37.0647, tenure: "Rented (sharecropping)" },
  { code: "Plot 14", crop: "Barley", areaHa: 0.9, soil: "Vertisol soil", zone: "Central Zone", lat: 9.1197, lng: 37.0588, tenure: "Certified holding (Level 1)" },
];

export const CROP_HISTORY: CropRecord[] = [
  { season: "2024 Meher", crop: "Teff", yield: "15 Quintal/ha", status: "Successful" },
  { season: "2024 Belg", crop: "Barley", yield: "9 Quintal/ha", status: "Average" },
  { season: "2023 Meher", crop: "Teff", yield: "14 Quintal/ha", status: "Successful" },
  { season: "2023 Belg", crop: "Chickpea", yield: "8 Quintal/ha", status: "Average" },
  { season: "2022 Meher", crop: "Maize", yield: "6 Quintal/ha", status: "Below average" },
];

export const VISITS: Visit[] = [
  { title: "Routine Status Check", summary: "Verified planting success on Plot 04. Germination optimal.", date: "05 Sep 2026", time: "09:40 AM" },
  { title: "Input Advisory Visit", summary: "Distributed improved teff seed variety. Discussed row spacing.", date: "14 Jul 2026", time: "10:15 AM" },
  { title: "Pre-Planting Inspection", summary: "Measured baseline nitrogen levels. Advised compost heap mix.", date: "22 Jun 2026", time: "01:40 PM" },
  { title: "Harvest Yield Survey", summary: "Recorded final Meher season yield for Plot 04 and Plot 07.", date: "18 Dec 2025", time: "11:00 AM" },
  { title: "Registration Visit", summary: "Initial farmer registration and plot boundary mapping completed.", date: "03 Nov 2025", time: "09:00 AM" },
];

export const DOCUMENTS: FarmerDocument[] = [
  { name: "Soil_Test_Plot_04.pdf", uploadedAt: "10 Jun 2024", size: "1.1 MB" },
  { name: "Land_Ownership_Cert.pdf", uploadedAt: "15 Feb 2024", size: "2.4 MB" },
  { name: "Fertilizer_Subsidy_Voucher.pdf", uploadedAt: "02 Apr 2024", size: "0.4 MB" },
  { name: "Plot_07_Boundary_Map.pdf", uploadedAt: "05 Mar 2023", size: "3.2 MB" },
  { name: "National_ID_Copy.pdf", uploadedAt: "03 Nov 2025", size: "0.8 MB" },
  { name: "Harvest_Yield_Report_2023.pdf", uploadedAt: "18 Nov 2023", size: "1.6 MB" },
  { name: "Harvest_Yield_Report_2022.pdf", uploadedAt: "18 Nov 2022", size: "1.3 MB" },
];

// Overview shows a short preview of each list; the dedicated tab shows everything.
export const OVERVIEW_DOCUMENT_COUNT = 4;
export const OVERVIEW_NOTE_COUNT = 5;

export const ADVISORY_NOTES: AdvisoryNote[] = [
  { date: "12 Jun 2026", author: "Tadesse Alemu", text: "Apply organic mulch to maintain soil moisture during brief dry spells." },
  { date: "28 May 2026", author: "Tadesse Alemu", text: "Approved switch from direct broadcasting to seed drilling for the upcoming season." },
  { date: "16 May 2026", author: "Tadesse Alemu", text: "Recommended improved teff seed variety (Boset) for better drought tolerance." },
  { date: "21 Apr 2026", author: "Almaz Wolde", text: "Discussed post-harvest storage practices to reduce grain loss from pests." },
  { date: "28 Feb 2026", author: "Tadesse Alemu", text: "Onboarding note: farmer new to the program, prioritized for first-season support." },
  { date: "14 Jan 2026", author: "Tadesse Alemu", text: "Confirmed irrigation schedule for Plot 04 ahead of the Belg season." },
  { date: "02 Dec 2025", author: "Almaz Wolde", text: "Reviewed fertilizer voucher usage; advised split application for maize." },
  { date: "19 Oct 2025", author: "Tadesse Alemu", text: "Flagged early signs of stem borer on Plot 07; recommended scouting twice weekly." },
];

export function getFarmer(id: string): Farmer | undefined {
  return FARMERS.find((f) => f.id === id);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
