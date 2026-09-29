import { useState } from "react";
import type { Farmer } from "../types";
import { matchFarmers, readWhen, VISIT_TYPES, type PlanVisitResult, type VisitPreset } from "./planVisit";

// Farmer search / selection, visit type and outcome state for the plan-visit form.
export function usePlanVisit(farmer: Farmer | undefined, preset: VisitPreset | undefined) {
  const [selected, setSelected] = useState<Farmer | undefined>(farmer);
  const [visitType, setVisitType] = useState(preset && VISIT_TYPES.includes(preset.visitType) ? preset.visitType : VISIT_TYPES[0]);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PlanVisitResult | null>(null);

  const term = query.trim().toLowerCase();
  const matches = matchFarmers(term);

  // Search button / Enter: show the results list (even if a farmer was already picked); a single hit is picked straight away.
  const runSearch = () => {
    setSearched(true);
    if (term && matches.length === 1) setSelected(matches[0]);
    else setSelected(undefined);
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    setSearched(false);
  };

  const finish = (kind: PlanVisitResult["kind"]) => setResult({ kind, farmer: selected?.name, when: readWhen() });

  return { selected, setSelected, visitType, setVisitType, query, changeQuery, searched, term, matches, runSearch, result, finish };
}
