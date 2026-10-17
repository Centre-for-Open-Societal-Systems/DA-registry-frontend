import { describe, expect, it } from "vitest";
import { FARMERS } from "./data";
import { getLivestockPrefill, getLivestockReportDetails, LIVESTOCK_REPORT_FORM, livestockValueKey as valueKey } from "./livestockReport";

describe("LIVESTOCK_REPORT_FORM", () => {
  it("has five stages and no field key repeated within a section", () => {
    expect(LIVESTOCK_REPORT_FORM.map((t) => t.label)).toEqual(["Livestock Holding", "Herd Composition", "Health & Vaccination", "Feeding & Water", "Production & Sales"]);
    for (const tab of LIVESTOCK_REPORT_FORM) {
      for (const section of tab.sections) {
        const keys = section.fields.map((f) => f.key);
        expect(new Set(keys).size).toBe(keys.length);
      }
    }
  });

  it("gives every select, radio and multi-select its options", () => {
    const choiceFields = LIVESTOCK_REPORT_FORM.flatMap((t) => t.sections.flatMap((s) => s.fields)).filter((f) => ["select", "radio", "multiselect"].includes(f.type));
    expect(choiceFields.every((f) => (f.options?.length ?? 0) > 0)).toBe(true);
  });
});

describe("getLivestockPrefill", () => {
  it("fills identity and the herd that matches the farmer's livestock", () => {
    const farmer = FARMERS.find((f) => f.livestock === "Sheep")!;
    const prefill = getLivestockPrefill(farmer);

    expect(prefill[valueKey("identity", "farmer_name")]).toBe(farmer.name);
    expect(prefill[valueKey("herd", "species")]).toBe("Sheep");
    expect(prefill[valueKey("herd", "breed")]).toBe("Horro");
    expect(prefill[valueKey("vaccination", "last_vaccination_date")]).toBe("2026-01-15");
  });

  it("only fills keys that exist on the form", () => {
    const formKeys = new Set(LIVESTOCK_REPORT_FORM.flatMap((t) => t.sections.flatMap((s) => s.fields.map((f) => valueKey(s.id, f.key)))));
    expect(Object.keys(getLivestockPrefill(FARMERS[0])).every((k) => formKeys.has(k))).toBe(true);
  });
});

describe("getLivestockReportDetails", () => {
  it("lays the record out with the 5 Livestock Details tabs and their sections", () => {
    const farmer = FARMERS.find((f) => f.livestock === "Cattle")!;
    const tabs = getLivestockReportDetails(farmer);

    expect(tabs.map((t) => t.key)).toEqual(["farmer", "livestock", "health", "breeding", "imports"]);
    expect(tabs.map((t) => t.label)).toEqual([
      "Farmer",
      "Livestock",
      "Health & Vaccination",
      "Breeding & Vital Events",
      "Imports & Audit",
    ]);

    expect(tabs[0].sections.map((s) => s.title)).toEqual(["Livestock Record", "Survey Personnel", "Location"]);
    expect(tabs[1].sections.map((s) => s.title)).toEqual(["Livestock Details", "Ear Tag Replacement"]);
    expect(tabs[2].sections.map((s) => s.title)).toEqual(["Health Event Details", "Vaccination Details"]);
    expect(tabs[3].sections.map((s) => s.title)).toEqual(["Vital Event Details", "Breeding Details"]);
    expect(tabs[4].sections.map((s) => s.title)).toEqual(["Import Batch Details", "Audit Log Details"]);

    const farmerTabFields = tabs[0].sections[0].fields;
    expect(farmerTabFields.find((f) => f.key === "farmer")?.isFarmerAvatar).toBe(true);
  });
});

describe("required fields", () => {
  it("marks report year and season as required, and nothing else", () => {
    const required = LIVESTOCK_REPORT_FORM.flatMap((t) => t.sections.flatMap((s) => s.fields)).filter((f) => f.required).map((f) => f.key);
    expect(required).toEqual(["report_year", "report_season"]);
  });
});
