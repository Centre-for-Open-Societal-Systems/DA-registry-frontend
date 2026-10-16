import { HERDS } from "./data";
import { registryCode } from "./components/planVisit";
import type { Farmer } from "./types";

// Livestock Report: the tab → section → field list for the Submit Livestock Report form and the profile's
// "Livestock Details" tab. Kept separate from the Crop Sown Registry (cropSown.ts) so either form can change on
// its own. `key` is the field name the Livestock API will use. Values are sample data until that API exists.

export type LivestockFieldType = "text" | "number" | "date" | "select" | "multiselect" | "radio" | "geo";

export interface LivestockFieldDef {
  key: string;
  label: string;
  type: LivestockFieldType;
  options?: readonly string[];
  /** The DA must fill it before submitting. */
  required?: boolean;
}

export interface LivestockSectionDef {
  id: string;
  title: string;
  fields: LivestockFieldDef[];
}

export interface LivestockTabDef {
  key: string;
  label: string;
  sections: LivestockSectionDef[];
}

/** Form values keyed by `livestockValueKey(section, field)`. */
export type LivestockValues = Record<string, string>;

export const livestockValueKey = (sectionId: string, fieldKey: string) => `${sectionId}.${fieldKey}`;

// ── Option lists ────────────────────────────────────────────────────────────────────────────────────────

const YES_NO = ["Yes", "No"];
const SEASONS = ["Meher", "Belg", "Bega"];
const SPECIES = ["Cattle", "Sheep", "Goats", "Poultry", "Camel", "Equine", "Bee colonies"];
const BREED_TYPES = ["Local", "Crossbred", "Exotic"];
const BREEDS = ["Boran (local)", "Horro", "Arsi-Bale", "Sasso (improved)", "Holstein-Friesian cross", "Jersey cross", "Fogera", "Begait"];
const SYSTEMS = ["Mixed crop-livestock", "Agro-pastoral", "Pastoral", "Commercial / intensive"];
const PURPOSES = ["Dairy", "Meat", "Draught", "Eggs", "Breeding", "Wool / hides", "Honey"];
const HOUSING = ["Zero-grazing shed", "Communal grazing", "Backyard coop", "Night enclosure (boma)", "Free range"];
const VACCINES = ["FMD", "Lumpy skin disease", "Anthrax", "Blackleg", "PPR", "Sheep & goat pox", "Pasteurellosis", "Newcastle disease"];
const VACCINATION_STATUS = ["Up to date", "Due", "Overdue"];
const DISEASES = ["FMD", "Lumpy skin disease", "Trypanosomosis", "Internal parasites", "External parasites", "Mastitis", "Newcastle disease", "PPR"];
const TREATMENTS = ["Treated by vet", "Treated by CAHW", "Self-treated", "Not treated"];
const VET_PROVIDERS = ["Government vet clinic", "Private vet", "Community animal health worker", "None"];
const FEED_SOURCES = ["Natural pasture", "Crop residue", "Improved forage", "Hay", "Concentrate", "Agro-industrial by-product"];
const FORAGES = ["Desho grass", "Napier / elephant grass", "Rhodes grass", "Oats-vetch", "Lablab", "Sesbania"];
const WATER_SOURCES = ["River", "Well", "Pond", "Spring", "Piped water", "Dam"];
const FREQUENCIES = ["Twice a day", "Daily", "Every other day", "Twice a week"];
const MARKETS = ["Local market", "Cooperative", "Trader at farm gate", "Abattoir", "Not sold"];
const LOSS_REASONS = ["Disease", "Feed shortage", "Drought", "Predator", "Theft", "Accident", "None"];

// ── Field list ──────────────────────────────────────────────────────────────────────────────────────────

type Def = [key: string, label: string, type: LivestockFieldType, options?: readonly string[]];

// Fields the DA must fill before submitting.
const REQUIRED_KEYS = new Set(["report_year", "report_season"]);

const section = (id: string, title: string, defs: Def[]): LivestockSectionDef => ({
  id,
  title,
  fields: defs.map(([key, label, type, options]) => ({ key, label, type, options, ...(REQUIRED_KEYS.has(key) && { required: true }) })),
});

export const LIVESTOCK_REPORT_FORM: LivestockTabDef[] = [
  {
    key: "holding",
    label: "Livestock Holding",
    sections: [
      section("identity", "Farmer Identity", [
        ["farmer_id", "Farmer ID", "text"],
        ["farmer_name", "Farmer Name", "text"],
        ["fayda_fan_id", "Fayda ID (FAN)", "text"],
        ["report_year", "Report Year", "text"],
        ["report_season", "Season", "select", SEASONS],
      ]),
      section("address", "Address / Location", [
        ["geo_code_hierarchy_json", "Location Hierarchy", "geo"],
        ["latitude", "Geo Latitude", "text"],
        ["longitude", "Geo Longitude", "text"],
      ]),
      section("holding", "Holding", [
        ["production_system", "Production System", "select", SYSTEMS],
        ["primary_species", "Primary Species", "select", SPECIES],
        ["total_heads", "Total Heads (all species)", "number"],
        ["grazing_land_ha", "Grazing Land (ha)", "number"],
        ["housing", "Housing", "select", HOUSING],
      ]),
    ],
  },
  {
    key: "herd",
    label: "Herd Composition",
    sections: [
      section("herd", "Herd / Flock", [
        ["herd_code", "Herd Code", "text"],
        ["species", "Species", "select", SPECIES],
        ["breed", "Breed", "select", BREEDS],
        ["breed_type", "Breed Type", "radio", BREED_TYPES],
        ["purpose", "Purpose", "multiselect", PURPOSES],
      ]),
      section("structure", "Herd Structure", [
        ["adult_males", "Adult Males", "number"],
        ["adult_females", "Adult Females", "number"],
        ["young_stock", "Young Stock", "number"],
        ["heads_total", "Total Heads", "number"],
        ["pregnant_females", "Pregnant Females", "number"],
        ["new_additions", "Bought / Received This Season", "number"],
      ]),
    ],
  },
  {
    key: "health",
    label: "Health & Vaccination",
    sections: [
      section("vaccination", "Vaccination", [
        ["vaccines_given", "Vaccines Given", "multiselect", VACCINES],
        ["last_vaccination_date", "Last Vaccination Date", "date"],
        ["next_vaccination_due", "Next Vaccination Due", "date"],
        ["vaccination_status", "Vaccination Status", "select", VACCINATION_STATUS],
        ["animals_vaccinated", "Animals Vaccinated", "number"],
      ]),
      section("disease", "Disease & Treatment", [
        ["disease_observed", "Disease Observed", "radio", YES_NO],
        ["disease_type", "Disease Type", "multiselect", DISEASES],
        ["animals_affected", "Animals Affected", "number"],
        ["deaths", "Deaths", "number"],
        ["treatment", "Treatment", "select", TREATMENTS],
        ["vet_service_provider", "Vet Service Provider", "select", VET_PROVIDERS],
        ["last_deworming_date", "Last Deworming Date", "date"],
      ]),
    ],
  },
  {
    key: "feeding",
    label: "Feeding & Water",
    sections: [
      section("feed", "Feed", [
        ["feed_sources", "Feed Sources", "multiselect", FEED_SOURCES],
        ["improved_forage", "Improved Forage Grown", "select", FORAGES],
        ["forage_area_ha", "Forage Area (ha)", "number"],
        ["supplement_given", "Supplement / Concentrate Given", "radio", YES_NO],
        ["feed_shortage", "Feed Shortage This Season", "radio", YES_NO],
        ["feed_shortage_months", "Months of Feed Shortage", "number"],
      ]),
      section("water", "Water", [
        ["water_source", "Water Source", "select", WATER_SOURCES],
        ["watering_frequency", "Watering Frequency", "select", FREQUENCIES],
        ["water_distance_km", "Distance to Water (km)", "number"],
      ]),
    ],
  },
  {
    key: "production",
    label: "Production & Sales",
    sections: [
      section("output", "Production", [
        ["milking_cows", "Milking Cows", "number"],
        ["milk_litres_per_day", "Milk (L/day, whole herd)", "number"],
        ["eggs_per_month", "Eggs per Month", "number"],
        ["births", "Births This Season", "number"],
        ["ai_service_used", "AI Service Used", "radio", YES_NO],
        ["ai_inseminations", "Inseminations", "number"],
      ]),
      section("sales", "Sales & Losses", [
        ["animals_sold", "Animals Sold", "number"],
        ["sale_income_etb", "Sale Income (ETB)", "number"],
        ["market", "Main Market", "select", MARKETS],
        ["loss_reason", "Main Loss Reason", "select", LOSS_REASONS],
        ["animals_lost", "Animals Lost", "number"],
      ]),
    ],
  },
];

// ── Sample record ───────────────────────────────────────────────────────────────────────────────────────

/** "12 Jun 2026" → "2026-06-12". */
const toIso = (display: string) => {
  const d = new Date(display);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * What the Farmer Registry and the last livestock census already hold for a farmer: the form fills these as soon
 * as the farmer is found and shows them read-only; the DA enters what they count and observe this season.
 */
export function getLivestockPrefill(farmer: Farmer): LivestockValues {
  const herd = HERDS.find((h) => h.animal === farmer.livestock) ?? HERDS[0];
  const woreda = farmer.woreda.replace(/ woreda$/i, "");
  const values: Record<string, string> = {
    [livestockValueKey("identity", "farmer_id")]: registryCode(farmer),
    [livestockValueKey("identity", "farmer_name")]: farmer.name,
    [livestockValueKey("identity", "fayda_fan_id")]: `FAN-${registryCode(farmer).replace(/\D/g, "").padStart(6, "0")}`,
    [livestockValueKey("address", "geo_code_hierarchy_json")]: `${farmer.region} › ${woreda} › ${farmer.kebele}`,
    [livestockValueKey("address", "latitude")]: "8.9806",
    [livestockValueKey("address", "longitude")]: "37.0522",
    [livestockValueKey("holding", "primary_species")]: farmer.livestock,
    [livestockValueKey("holding", "housing")]: herd.housing,
    [livestockValueKey("herd", "herd_code")]: herd.code,
    [livestockValueKey("herd", "species")]: herd.animal,
    [livestockValueKey("herd", "breed")]: herd.breed,
    [livestockValueKey("vaccination", "last_vaccination_date")]: toIso(herd.lastVaccinated),
  };
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v));
}

const PURPOSE_BY_SPECIES: Record<string, string> = { Cattle: "Dairy, Draught", Sheep: "Meat, Wool / hides", Goats: "Meat, Dairy", Poultry: "Eggs, Meat" };
const VACCINES_BY_SPECIES: Record<string, string> = { Cattle: "FMD, Lumpy skin disease, Anthrax", Sheep: "PPR, Sheep & goat pox", Goats: "PPR, Sheep & goat pox", Poultry: "Newcastle disease" };

/**
 * The farmer's last submitted livestock report (2026 Meher), for the profile's "Livestock Details" tab. Sample data
 * derived from the farmer's record and herd until the Livestock API exists. Dates are ISO yyyy-mm-dd.
 */
export function getLivestockReportRecord(farmer: Farmer): LivestockValues {
  const herd = HERDS.find((h) => h.animal === farmer.livestock) ?? HERDS[0];
  const heads = farmer.livestockHeads;
  const isPoultry = herd.animal === "Poultry";
  const isCattle = herd.animal === "Cattle";
  const females = Math.max(1, Math.round(heads * 0.6));
  const males = Math.max(0, Math.round(heads * 0.15));
  const young = Math.max(0, heads - females - males);
  const sold = isPoultry ? Math.round(heads * 0.2) : Math.min(2, Math.floor(heads / 4));
  const v = (sectionId: string, key: string, value: string | number) => [livestockValueKey(sectionId, key), String(value)] as const;

  return {
    ...getLivestockPrefill(farmer),
    ...Object.fromEntries([
      v("identity", "report_year", "2026"),
      v("identity", "report_season", "Meher"),
      v("holding", "production_system", "Mixed crop-livestock"),
      v("holding", "total_heads", heads),
      v("holding", "grazing_land_ha", (farmer.landHa * 0.3).toFixed(1)),
      v("herd", "breed_type", herd.breed.includes("improved") || herd.breed.includes("cross") ? "Crossbred" : "Local"),
      v("herd", "purpose", PURPOSE_BY_SPECIES[herd.animal] ?? herd.purpose),
      v("structure", "adult_males", males),
      v("structure", "adult_females", females),
      v("structure", "young_stock", young),
      v("structure", "heads_total", heads),
      v("structure", "pregnant_females", isPoultry ? 0 : Math.floor(females / 3)),
      v("structure", "new_additions", 0),
      v("vaccination", "vaccines_given", VACCINES_BY_SPECIES[herd.animal] ?? "FMD"),
      v("vaccination", "next_vaccination_due", "2026-12-10"),
      v("vaccination", "vaccination_status", herd.vaccination),
      v("vaccination", "animals_vaccinated", herd.vaccination === "Overdue" ? 0 : heads),
      v("disease", "disease_observed", "Yes"),
      v("disease", "disease_type", isPoultry ? "Newcastle disease" : "Internal parasites"),
      v("disease", "animals_affected", Math.max(1, Math.round(heads * 0.2))),
      v("disease", "deaths", isPoultry ? 2 : 0),
      v("disease", "treatment", "Treated by CAHW"),
      v("disease", "vet_service_provider", "Community animal health worker"),
      v("disease", "last_deworming_date", "2026-08-20"),
      v("feed", "feed_sources", isPoultry ? "Concentrate, Crop residue" : "Natural pasture, Crop residue, Improved forage"),
      v("feed", "improved_forage", isPoultry ? "" : "Desho grass"),
      v("feed", "forage_area_ha", isPoultry ? 0 : 0.1),
      v("feed", "supplement_given", isCattle || isPoultry ? "Yes" : "No"),
      v("feed", "feed_shortage", "Yes"),
      v("feed", "feed_shortage_months", 2),
      v("water", "water_source", "River"),
      v("water", "watering_frequency", "Daily"),
      v("water", "water_distance_km", 1.5),
      v("output", "milking_cows", isCattle ? Math.max(1, Math.floor(females / 2)) : 0),
      v("output", "milk_litres_per_day", isCattle ? Math.max(1, Math.floor(females / 2)) * 4 : 0),
      v("output", "eggs_per_month", isPoultry ? heads * 12 : 0),
      v("output", "births", isPoultry ? 0 : Math.floor(females / 2)),
      v("output", "ai_service_used", isCattle ? "Yes" : "No"),
      v("output", "ai_inseminations", isCattle ? 1 : 0),
      v("sales", "animals_sold", sold),
      v("sales", "sale_income_etb", sold * (isPoultry ? 450 : isCattle ? 28000 : 6500)),
      v("sales", "market", sold > 0 ? "Local market" : "Not sold"),
      v("sales", "loss_reason", isPoultry ? "Disease" : "None"),
      v("sales", "animals_lost", isPoultry ? 2 : 0),
    ].filter(([, value]) => value !== "")),
  };
}

// ── Display ─────────────────────────────────────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A stored value as shown on screen: dates as "10 Dec 2026", empty as "—". */
export function formatLivestockValue(field: LivestockFieldDef, raw: string | undefined): string {
  if (!raw) return "—";
  const date = field.type === "date" && /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  return date ? `${date[3]} ${MONTHS[Number(date[2]) - 1] ?? date[2]} ${date[1]}` : raw;
}

export interface LivestockDetailsTab {
  key: string;
  label: string;
  sections: { title: string; fields: { key: string; label: string; value: string }[] }[];
}

/** The farmer's livestock report laid out stage → section → field, ready to display. */
export function getLivestockReportDetails(farmer: Farmer): LivestockDetailsTab[] {
  const record = getLivestockReportRecord(farmer);
  return LIVESTOCK_REPORT_FORM.map((tab) => ({
    key: tab.key,
    label: tab.label,
    sections: tab.sections.map((s) => ({
      title: s.title,
      fields: s.fields.map((f) => ({ key: f.key, label: f.label, value: formatLivestockValue(f, record[livestockValueKey(s.id, f.key)]) })),
    })),
  }));
}
