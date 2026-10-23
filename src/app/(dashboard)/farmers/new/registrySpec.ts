import { toEthiopianDate } from "./ethiopianDate";
import { REGIONS } from "./locationData";

// Register Farmer steps, taken from "Farmer Registry - Tab, Section and Field List".
// Only fields an agent can fill in are listed; system, generated and derived fields
// (IDs, audit stamps, land totals, the flattened region/zone/woreda/kebele projections)
// are left out. The Location tab is a composite cascade, so it has its own step component.

export type FieldType = "text" | "number" | "date" | "tel" | "select" | "radio" | "checkbox" | "textarea" | "file" | "derived" | "capture";

export interface RegistryField {
  /** Registry internal name, also the form field name. */
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  /** Enabled only while another field holds this value; the field stays on screen, greyed out, until then. */
  showWhen?: { field: string; equals: string };
  hint?: string;
  /** Worked out from the other fields and shown read-only (land totals, "certificate provided"). */
  derive?: (values: Record<string, string>) => string;
  /** Value the field starts with until the agent changes it. */
  defaultValue?: string;
  /** Replaces the default "Enter <label>" / "Select <label>" prompt. */
  placeholder?: string;
  /** Spans the whole row. */
  wide?: boolean;
  /** Coordinate fields: shows a pin that fills latitude and longitude (and, for the enumerator, altitude and accuracy) from the device. */
  locate?: boolean;
  /** Checkbox only: heading over a run of consecutive checkboxes, set on the first of them. */
  group?: string;
}

export interface RegistrySection {
  title: string;
  /** One line under the title. */
  description?: string;
  /** Fields per row from xl up (default 3). */
  columns?: 3 | 4;
  fields: RegistryField[];
}

export interface RegistryTab {
  key: string;
  label: string;
  /** Title and line of the card that wraps the step's sections (steps without one render the bare sections). */
  heading?: { title: string; description: string };
  sections: RegistrySection[];
}

const YES_NO = ["Yes", "No"] as const;
const LANGUAGES = ["Amharic", "Afaan Oromo", "Tigrinya", "Somali", "Sidamo", "English"] as const;

const KEBELES = [...new Set(REGIONS.flatMap((r) => r.zones.flatMap((z) => z.woredas.flatMap((w) => w.kebeles))))].sort();

/** One parcel is registered here, so each land total is its area when the ownership type matches, else 0. */
const landTotal = (ownership?: string) => (values: Record<string, string>) => {
  const area = parseFloat(values.area_in_hectare ?? "");
  if (Number.isNaN(area)) return "";
  return String(!ownership || values.land_ownership_type === ownership ? area : 0);
};

export const REGISTRY_TABS: RegistryTab[] = [
  {
    key: "farmer",
    label: "Farmer",
    heading: { title: "Farmer Profile", description: "Record the farmer's personal, contact, birth, socio-economic and health information." },
    sections: [
      {
        title: "Personal Information",
        description: "Enter names in English, Amharic and Afaan Oromo, including the father's name.",
        fields: [
          { name: "first_name", label: "First Name (English)", type: "text", required: true },
          { name: "middle_name", label: "Middle Name (English)", type: "text" },
          { name: "last_name", label: "Last Name (English)", type: "text", required: true },
          { name: "first_name_amh", label: "First Name (Amharic)", type: "text", required: true },
          { name: "middle_name_amh", label: "Middle Name (Amharic)", type: "text" },
          { name: "last_name_amh", label: "Last Name (Amharic)", type: "text", required: true },
          { name: "first_name_om", label: "First Name (Afaan Oromo)", type: "text", required: true },
          { name: "middle_name_om", label: "Middle Name (Afaan Oromo)", type: "text" },
          { name: "last_name_om", label: "Last Name (Afaan Oromo)", type: "text", required: true },
          { name: "father_first_name", label: "Father's First Name", type: "text", required: true },
          { name: "father_middle_name", label: "Father's Middle Name", type: "text" },
          { name: "father_last_name", label: "Father's Last Name", type: "text", required: true },
        ],
      },
      {
        title: "Phone Numbers",
        description: "Add contact numbers and mark one as the primary number.",
        columns: 4,
        fields: [
          { name: "phone_type", label: "Phone Type", type: "select", options: ["Mobile", "Home", "Work"], required: true },
          { name: "phone_number", label: "Phone Number", type: "tel", required: true },
          { name: "country_code", label: "Country Code", type: "text", required: true },
          { name: "phone_priority", label: "Phone Priority", type: "radio", options: ["Primary", "Secondary"], required: true },
        ],
      },
      {
        title: "Birth Details",
        description: "Enter gender, age and birth dates in Gregorian and Ethiopian calendars.",
        columns: 4,
        fields: [
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"], required: true },
          { name: "birth_date", label: "Date Of Birth (GC)", type: "date", required: true },
          { name: "birth_date_ec", label: "Date Of Birth (EC)", type: "text", required: true, hint: "Ethiopian-calendar date string" },
          { name: "estimated_age", label: "Age", type: "number", required: true },
        ],
      },
      {
        title: "Socio-economic and Health Details",
        description: "Record income, education, marital status, PSNP participation and disability details.",
        fields: [
          { name: "source_of_income", label: "Household Income", type: "select", options: ["Farming", "Livestock", "Trade", "Employment", "Remittance", "Others"], required: true },
          { name: "source_of_income_other", label: "Other Income Source", type: "text", required: true, hint: "Shown when income is Others", showWhen: { field: "source_of_income", equals: "Others" } },
          { name: "education_level", label: "Education Level", type: "select", options: ["No formal education", "Primary", "Secondary", "Preparatory", "Certificate / TVET", "Diploma", "Degree and above"], required: true },
          { name: "marital_status", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"], required: true },
          { name: "is_psnp_user", label: "PSNP User", type: "select", options: YES_NO, required: true },
          { name: "disabled", label: "Disabled", type: "select", options: YES_NO, required: true },
          { name: "disability_type", label: "Disability Type", type: "select", options: ["Physical", "Visual", "Hearing", "Intellectual", "Mental health", "Other"], required: true, hint: "Shown when Disabled is Yes", showWhen: { field: "disabled", equals: "Yes" } },
          { name: "disability_severity", label: "Disability Severity", type: "select", options: ["Mild", "Moderate", "Severe"], required: true, hint: "Shown when Disabled is Yes", showWhen: { field: "disabled", equals: "Yes" } },
        ],
      },
    ],
  },
  {
    key: "household",
    label: "Household",
    heading: { title: "Household Information", description: "Link the farmer to a household and record family size and member details." },
    sections: [
      {
        title: "Household Link",
        description: "Confirm household-head status and link the farmer to an existing or new household.",
        fields: [
          { name: "is_household_head", label: "Are You a Household Head?", type: "radio", options: YES_NO, required: true },
          { name: "link_internal_record_id", label: "Household", type: "text", required: true, hint: "Search the household register or create a new household" },
        ],
      },
      {
        title: "Household Composition",
        description: "Enter male, female and child counts, total family size and included parents.",
        fields: [
          { name: "number_of_male_members", label: "Number Of Males In The Family", type: "number", required: true },
          { name: "number_of_female_members", label: "Number Of Females In The Family", type: "number", required: true },
          { name: "number_of_children", label: "Number Of Children In The Family", type: "number", required: true },
          { name: "size_of_group", label: "Family Size", type: "number", required: true, hint: "Total number of people in the household" },
          { name: "other_land_owner", label: "Household Farms Land Owned By Others", type: "radio", options: YES_NO, required: true },
          { name: "father_included", label: "Father Included", type: "checkbox", group: "Members included" },
          { name: "mother_included", label: "Mother Included", type: "checkbox" },
        ],
      },
    ],
  },
  {
    key: "location",
    label: "Location",
    heading: { title: "Location Information", description: "Identify the farmer's administrative area, GPS location and spoken languages." },
    sections: [
      {
        title: "GPS Coordinates and Languages",
        description: "Enter latitude and longitude, then select the farmer's primary and local languages.",
        columns: 4,
        fields: [
          { name: "latitude", label: "Geo Latitude", type: "number", required: true, locate: true },
          { name: "longitude", label: "Geo Longitude", type: "number", required: true, locate: true },
          { name: "language_spoken", label: "Primary Language", type: "select", options: LANGUAGES, required: true },
          { name: "local_language", label: "Local Language", type: "select", options: LANGUAGES, required: true },
        ],
      },
    ],
  },
  {
    key: "lands",
    label: "Lands",
    heading: { title: "Land Holdings", description: "Review land totals and record parcel ownership, area and land use." },
    sections: [
      {
        title: "Land Summary and Parcels",
        description: "View calculated land totals and enter parcel details below.",
        fields: [
          { name: "total_owned_land", label: "Total Owned Land", type: "number", required: true, derive: landTotal("Owned") },
          { name: "total_rented_land", label: "Total Rented Land", type: "number", required: true, derive: landTotal("Rented") },
          { name: "total_crop_sharing_land", label: "Total Crop Sharing Land", type: "number", required: true, derive: landTotal("Crop sharing") },
          { name: "total_land_area", label: "Total Land Area", type: "number", required: true, derive: landTotal() },
          { name: "land_ownership", label: "Land Ownership", type: "text", required: true },
          { name: "land_id", label: "Land ID", type: "text", required: true },
          { name: "area_in_hectare", label: "Area In Hectare", type: "number", required: true },
          { name: "land_ownership_type", label: "Land Ownership Type", type: "select", options: ["Owned", "Rented", "Crop sharing"], required: true },
          { name: "land_kebele", label: "Land Kebele Is In", type: "select", options: KEBELES, required: true },
          { name: "land_certificate", label: "Land Certificate", type: "file", required: true },
          { name: "certificate_provided", label: "Certificate Provided", type: "derived", required: true, derive: (v) => (v.land_certificate ? "Yes" : "No") },
          { name: "soil_fertility", label: "Soil Fertility", type: "select", options: ["Low", "Medium", "High"], required: true },
          { name: "current_land_use", label: "Current Land Use", type: "select", options: ["Cropland", "Grazing", "Fallow", "Forest", "Mixed"], required: true },
          { name: "means_of_acquisition", label: "Means Of Acquisition", type: "select", options: ["Inherited", "Allocated by government", "Purchased", "Rented in", "Gift"], required: true },
          { name: "remark", label: "Remark", type: "textarea", required: true, wide: true },
        ],
      },
    ],
  },
  {
    key: "crops",
    label: "Crops",
    heading: { title: "Crop Registration", description: "Record the farmer's crops, planting dates, seasons and intended use." },
    sections: [
      {
        title: "Crop Details",
        description: "Select the crop, enter planting dates and specify the growing season and end use.",
        fields: [
          { name: "commodity", label: "Commodity", type: "select", options: ["Teff", "Wheat", "Maize", "Barley", "Sorghum", "Sesame", "Coffee", "Chickpea", "Faba bean", "Potato", "Onion"], required: true, placeholder: "Select commodity..." },
          { name: "planted_date", label: "Planted Date", type: "date", required: true, placeholder: "Select date" },
          { name: "planted_date_ec", label: "Planted Date (EC)", type: "text", required: true, hint: "Ethiopian calendar", placeholder: "Filled from the planted date", derive: (v) => toEthiopianDate(v.planted_date ?? "") },
          { name: "season", label: "Season", type: "select", options: ["Meher", "Belg"], required: true, placeholder: "Select season..." },
          { name: "end_use", label: "End Use", type: "select", options: ["Home consumption", "Sale", "Seed", "Animal feed", "Mixed"], placeholder: "Select end use..." },
        ],
      },
    ],
  },
  {
    key: "livestocks",
    label: "Livestocks",
    heading: { title: "Livestock Registration", description: "Record the farmer's livestock and their rearing and production characteristics." },
    sections: [
      {
        title: "Livestock Details",
        description: "Enter the animal type, breed, head count, rearing system and production details.",
        fields: [
          { name: "livestock_type", label: "Livestock Type", type: "select", options: ["Cattle", "Sheep", "Goat", "Poultry", "Camel", "Donkey", "Horse", "Bees"], required: true, placeholder: "Select type..." },
          { name: "breed", label: "Breed", type: "select", options: ["Local", "Crossbred", "Exotic"], required: true, placeholder: "Select breed..." },
          { name: "head_count", label: "Head Count", type: "number", required: true, placeholder: "0" },
          { name: "livestock_system", label: "Livestock System", type: "select", options: ["Mixed crop-livestock", "Pastoral", "Agro-pastoral", "Urban / peri-urban"], required: true, placeholder: "Select system..." },
          { name: "livestock_gender", label: "Gender", type: "select", options: ["Male", "Female", "Mixed"], required: true, placeholder: "Select gender..." },
          { name: "body_condition", label: "Body Condition", type: "select", options: ["Poor", "Fair", "Good", "Very good"], required: true, placeholder: "Select condition..." },
          { name: "production_type", label: "Production Type", type: "select", options: ["Milk", "Meat", "Eggs", "Draught", "Honey", "Mixed"], required: true, placeholder: "Select production type..." },
        ],
      },
    ],
  },
  {
    key: "ids",
    label: "IDs",
    heading: { title: "Identification Documents", description: "Record the farmer's identification numbers, status and expiry dates." },
    sections: [
      {
        title: "Identification Details",
        description: "Enter the ID type, number, status and expiry dates.",
        fields: [
          { name: "id_type", label: "ID Type", type: "select", options: ["National ID (Fayda)", "Kebele ID", "Passport", "Driving License"], required: true, placeholder: "Select ID type..." },
          { name: "id_value", label: "Value", type: "text", required: true, placeholder: "Enter ID number" },
          { name: "id_status", label: "Status", type: "select", options: ["Active", "Expired", "Revoked"], required: true, defaultValue: "Active" },
          { name: "expiry_date", label: "Expiry Date (GC)", type: "date", required: true, placeholder: "Select date" },
          { name: "expiry_date_ec", label: "Expiry Date (EC)", type: "text", required: true, hint: "Ethiopian calendar", placeholder: "Select date" },
          { name: "id_description", label: "Description", type: "text", required: true, hint: "Saved with the record, not shown in the table", placeholder: "Optional note" },
        ],
      },
    ],
  },
  {
    key: "enumerator",
    label: "Enumerator",
    heading: { title: "Enumerator Information", description: "Review the enumerator and device location captured during registration." },
    sections: [
      {
        title: "Collection and GPS Details",
        description: "Review the collector, collection date and device GPS readings.",
        fields: [
          { name: "enumerator_name", label: "Enumerator Name", type: "text", required: true },
          { name: "enumerator_user_id", label: "Enumerator User ID", type: "text", required: true },
          { name: "data_collection_date", label: "Data Collection Date", type: "date", required: true, placeholder: "Select date" },
          { name: "enumerator_latitude", label: "Enumerator Latitude", type: "text", required: true, locate: true },
          { name: "enumerator_longitude", label: "Enumerator Longitude", type: "text", required: true, locate: true },
          { name: "enumerator_altitude", label: "Enumerator Altitude", type: "text", required: true },
          { name: "enumerator_accuracy", label: "Enumerator Accuracy", type: "text", required: true },
          { name: "enumerator_gps_captured_at", label: "GPS capture", type: "capture" },
        ],
      },
    ],
  },
];

// Location tab fields that come from the Region > Zone > Woreda > Kebele cascade.
export const LOCATION_HIERARCHY_FIELDS = [
  { name: "region", label: "Region" },
  { name: "zone", label: "Zone" },
  { name: "woreda", label: "Woreda" },
  { name: "kebele", label: "Kebele" },
] as const;

export const isFieldVisible = (field: RegistryField, values: Record<string, string>) =>
  !field.showWhen || values[field.showWhen.field] === field.showWhen.equals;
