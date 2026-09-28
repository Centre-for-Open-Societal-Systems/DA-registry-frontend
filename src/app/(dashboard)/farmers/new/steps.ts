export const REGISTRATION_STEPS = [
  { label: "Personal details" },
  { label: "Location and kebele" },
  { label: "ID and documents" },
  { label: "Specialization & qualification" },
  { label: "Review and submit" },
] as const;

export const TOTAL_STEPS = REGISTRATION_STEPS.length;
