import { REGISTRY_TABS } from "./registrySpec";

// One step per Farmer Registry tab, then a final review.
export const REGISTRATION_STEPS = [
  ...REGISTRY_TABS.map(({ key, label }) => ({ key, label })),
  { key: "review", label: "Review & submit" },
];

export const TOTAL_STEPS = REGISTRATION_STEPS.length;
