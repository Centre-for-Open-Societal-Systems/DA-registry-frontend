import { useState } from "react";
import type { Farmer } from "../types";
import { useAdvisoryStore } from "../advisoryStore";
import { ADVISORY_VISIT, matchFarmers, readWhen, VISIT_TYPES, type AdvisoryQa, type PlanVisitResult, type VisitPreset } from "./planVisit";

// Farmer search / selection, visit type and outcome state for the plan-visit form.
export function usePlanVisit(farmer: Farmer | undefined, preset: VisitPreset | undefined) {
  const [selected, setSelected] = useState<Farmer | undefined>(farmer);
  const [visitType, setVisitType] = useState(preset && VISIT_TYPES.includes(preset.visitType) ? preset.visitType : VISIT_TYPES[0]);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<PlanVisitResult | null>(null);
  const [advisoryQa, setAdvisoryQa] = useState<AdvisoryQa[]>([{ id: 1, question: "", answer: "" }]);

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

  const addAdvisory = useAdvisoryStore((s) => s.add);

  const finish = (kind: PlanVisitResult["kind"]) => {
    const when = readWhen();
    // Advisory Q&A goes to the farmer's Advisory tab; rows without a question are dropped.
    const items = advisoryQa.filter((qa) => qa.question.trim()).map((qa) => ({ question: qa.question.trim(), answer: qa.answer.trim() }));
    if (visitType === ADVISORY_VISIT && selected && items.length > 0) {
      addAdvisory({ farmerId: selected.id, when, status: kind === "draft" ? "Draft" : "Planned", items });
    }
    setResult({ kind, farmer: selected?.name, when });
  };

  return { selected, setSelected, visitType, setVisitType, advisoryQa, setAdvisoryQa, query, changeQuery, searched, term, matches, runSearch, result, finish };
}
