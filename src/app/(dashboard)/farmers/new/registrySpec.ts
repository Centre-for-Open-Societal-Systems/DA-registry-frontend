// Register Farmer steps, taken from "Farmer Registry - Tab, Section and Field List".
// Only fields an agent can fill in are listed; system, generated and derived fields
// (IDs, audit stamps, land totals, the flattened region/zone/woreda/kebele projections)
// are left out. The Location tab is a composite cascade, so it has its own step component.

export type FieldType = "text" | "number" | "date" | "tel" | "select";

export interface RegistryField {
  /** Registry internal name, also the form field name. */
  name: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  required?: boolean;
  /** Shown only while another field holds this value. */
  showWhen?: { field: string; equals: string };
  hint?: string;
}

export interface RegistrySection {
  title: string;
  fields: RegistryField[];
}

export interface RegistryTab {
  key: string;
  label: string;
  sections: RegistrySection[];
}

const YES_NO = ["Yes", "No"] as const;
const LANGUAGES = ["Amharic", "Afaan Oromo", "Tigrinya", "Somali", "Sidamo", "English"] as const;

export const REGISTRY_TABS: RegistryTab[] = [
  {
    key: "farmer",
    label: "Farmer",
    sections: [
      {
        title: "Personal Information",
        fields: [
          { name: "first_name", label: "First Name (English)", type: "text", required: true },
          { name: "middle_name", label: "Middle Name (English)", type: "text" },
          { name: "last_name", label: "Last Name (English)", type: "text", required: true },
          { name: "first_name_amh", label: "First Name (Amharic)", type: "text" },
          { name: "middle_name_amh", label: "Middle Name (Amharic)", type: "text" },
          { name: "last_name_amh", label: "Last Name (Amharic)", type: "text" },
          { name: "first_name_om", label: "First Name (Afaan Oromo)", type: "text" },
          { name: "middle_name_om", label: "Middle Name (Afaan Oromo)", type: "text" },
          { name: "last_name_om", label: "Last Name (Afaan Oromo)", type: "text" },
          { name: "father_first_name", label: "Father's First Name", type: "text" },
          { name: "father_middle_name", label: "Father's Middle Name", type: "text" },
          { name: "father_last_name", label: "Father's Last Name", type: "text" },
        ],
      },
      {
        title: "Phone Numbers",
        fields: [
          { name: "phone_type", label: "Phone Type", type: "select", options: ["Mobile", "Home", "Work"] },
          { name: "phone_number", label: "Phone Number", type: "tel", required: true },
          { name: "country_code", label: "Country Code", type: "text" },
        ],
      },
      {
        title: "Birth Information",
        fields: [
          { name: "gender", label: "Gender", type: "select", options: ["Male", "Female"], required: true },
          { name: "birth_date", label: "Date Of Birth (GC)", type: "date", required: true },
          { name: "birth_date_ec", label: "Date Of Birth (EC)", type: "text", hint: "Ethiopian calendar, e.g. 12/04/1985" },
          { name: "estimated_age", label: "Age", type: "number" },
        ],
      },
      {
        title: "Socio-economic and Health",
        fields: [
          { name: "source_of_income", label: "Household Income", type: "select", options: ["Farming", "Livestock", "Trade", "Employment", "Remittance", "Others"] },
          { name: "source_of_income_other", label: "Other Income Source", type: "text", showWhen: { field: "source_of_income", equals: "Others" } },
          { name: "education_level", label: "Education Level", type: "select", options: ["No formal education", "Primary", "Secondary", "Preparatory", "Certificate / TVET", "Diploma", "Degree and above"] },
          { name: "marital_status", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed"] },
          { name: "is_psnp_user", label: "PSNP User", type: "select", options: YES_NO },
          { name: "disabled", label: "Disabled", type: "select", options: YES_NO },
          { name: "disability_type", label: "Disability Type", type: "select", options: ["Physical", "Visual", "Hearing", "Intellectual", "Mental health", "Other"], showWhen: { field: "disabled", equals: "Yes" } },
          { name: "disability_severity", label: "Disability Severity", type: "select", options: ["Mild", "Moderate", "Severe"], showWhen: { field: "disabled", equals: "Yes" } },
        ],
      },
    ],
  },
  {
    key: "household",
    label: "Household",
    sections: [
      {
        title: "Household Link",
        fields: [
          { name: "is_household_head", label: "Are You a Household Head?", type: "select", options: YES_NO },
          { name: "link_internal_record_id", label: "Household", type: "text", hint: "Household record ID, if the household is already registered" },
        ],
      },
      {
        title: "Household Information",
        fields: [
          { name: "number_of_male_members", label: "Number Of Males In The Family", type: "number" },
          { name: "number_of_female_members", label: "Number Of Females In The Family", type: "number" },
          { name: "number_of_children", label: "Number Of Children In The Family", type: "number" },
          { name: "father_included", label: "Father Included", type: "select", options: YES_NO },
          { name: "mother_included", label: "Mother Included", type: "select", options: YES_NO },
          { name: "size_of_group", label: "Family Size", type: "number" },
          { name: "other_land_owner", label: "Household Farms Land Owned By Others", type: "select", options: YES_NO },
        ],
      },
    ],
  },
  {
    key: "location",
    label: "Location",
    sections: [
      {
        title: "Location",
        fields: [
          { name: "latitude", label: "Geo Latitude", type: "number" },
          { name: "longitude", label: "Geo Longitude", type: "number" },
          { name: "language_spoken", label: "Primary Language", type: "select", options: LANGUAGES },
          { name: "local_language", label: "Local Language", type: "select", options: LANGUAGES },
        ],
      },
    ],
  },
  {
    key: "lands",
    label: "Lands",
    sections: [
      {
        title: "Land Details",
        fields: [
          { name: "land_id", label: "Land ID", type: "text" },
          { name: "area_in_hectare", label: "Area In Hectare", type: "number" },
          { name: "land_ownership_type", label: "Land Ownership Type", type: "select", options: ["Owned", "Rented", "Crop sharing"] },
          { name: "land_kebele", label: "Land Kebele Is In", type: "text" },
          { name: "soil_fertility", label: "Soil Fertility", type: "text" },
          { name: "current_land_use", label: "Current Land Use", type: "select", options: ["Cropland", "Grazing", "Fallow", "Forest", "Mixed"] },
          { name: "means_of_acquisition", label: "Means Of Acquisition", type: "select", options: ["Inherited", "Allocated by government", "Purchased", "Rented in", "Gift"] },
          { name: "remark", label: "Remark", type: "text" },
        ],
      },
    ],
  },
  {
    key: "crops",
    label: "Crops",
    sections: [
      {
        title: "Crop Details",
        fields: [
          { name: "commodity", label: "Commodity", type: "select", options: ["Teff", "Wheat", "Maize", "Barley", "Sorghum", "Sesame", "Coffee", "Chickpea", "Faba bean", "Potato", "Onion"] },
          { name: "planted_date", label: "Planted Date", type: "date" },
          { name: "planted_date_ec", label: "Planted Date (EC)", type: "text", hint: "Ethiopian calendar, e.g. 20/03/2017" },
          { name: "season", label: "Season", type: "select", options: ["Meher", "Belg"] },
          { name: "end_use", label: "End Use", type: "select", options: ["Home consumption", "Sale", "Seed", "Animal feed", "Mixed"] },
        ],
      },
    ],
  },
  {
    key: "livestocks",
    label: "Livestocks",
    sections: [
      {
        title: "Livestock Details",
        fields: [
          { name: "livestock_type", label: "Livestock Type", type: "select", options: ["Cattle", "Sheep", "Goat", "Poultry", "Camel", "Donkey", "Horse", "Bees"] },
          { name: "breed", label: "Breed", type: "select", options: ["Local", "Crossbred", "Exotic"] },
          { name: "head_count", label: "Head Count", type: "number" },
          { name: "livestock_system", label: "Livestock System", type: "select", options: ["Mixed crop-livestock", "Pastoral", "Agro-pastoral", "Urban / peri-urban"] },
          { name: "livestock_gender", label: "Gender", type: "select", options: ["Male", "Female", "Mixed"] },
          { name: "body_condition", label: "Body Condition", type: "select", options: ["Poor", "Fair", "Good", "Very good"] },
          { name: "production_type", label: "Production Type", type: "select", options: ["Milk", "Meat", "Eggs", "Draught", "Honey", "Mixed"] },
        ],
      },
    ],
  },
  {
    key: "ids",
    label: "IDs",
    sections: [
      {
        title: "Registrant IDs",
        fields: [
          { name: "id_type", label: "ID Type", type: "select", options: ["National ID (Fayda)", "Kebele ID", "Passport", "Driving License"] },
          { name: "id_value", label: "Value", type: "text" },
          { name: "id_status", label: "Status", type: "select", options: ["Active", "Expired", "Revoked"] },
          { name: "expiry_date", label: "Expiry Date (GC)", type: "date" },
          { name: "expiry_date_ec", label: "Expiry Date (EC)", type: "text", hint: "Ethiopian calendar, e.g. 01/06/2020" },
          { name: "id_description", label: "Description", type: "text" },
        ],
      },
    ],
  },
  {
    key: "enumerator",
    label: "Enumerator",
    sections: [
      {
        title: "Enumerator Details",
        fields: [
          { name: "enumerator_name", label: "Enumerator Name", type: "text" },
          { name: "enumerator_user_id", label: "Enumerator User ID", type: "text" },
          { name: "data_collection_date", label: "Data Collection Date", type: "date" },
          { name: "enumerator_latitude", label: "Enumerator Latitude", type: "number" },
          { name: "enumerator_longitude", label: "Enumerator Longitude", type: "number" },
          { name: "enumerator_altitude", label: "Enumerator Altitude", type: "number" },
          { name: "enumerator_accuracy", label: "Enumerator Accuracy", type: "number" },
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
