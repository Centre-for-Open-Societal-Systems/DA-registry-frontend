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
  it("lays the record out stage by stage, with formatted dates and every field present", () => {
    const farmer = FARMERS.find((f) => f.livestock === "Cattle")!;
    const tabs = getLivestockReportDetails(farmer);

    expect(tabs.map((t) => t.key)).toEqual(LIVESTOCK_REPORT_FORM.map((t) => t.key));
    const fields = tabs.flatMap((t) => t.sections.flatMap((s) => s.fields));
    expect(fields.length).toBe(LIVESTOCK_REPORT_FORM.flatMap((t) => t.sections.flatMap((s) => s.fields)).length);
    expect(fields.find((f) => f.key === "next_vaccination_due")?.value).toBe("10 Dec 2026");
    expect(fields.find((f) => f.key === "heads_total")?.value).toBe(String(farmer.livestockHeads));
  });
});

describe("required fields", () => {
  it("marks report year and season as required, and nothing else", () => {
    const required = LIVESTOCK_REPORT_FORM.flatMap((t) => t.sections.flatMap((s) => s.fields)).filter((f) => f.required).map((f) => f.key);
    expect(required).toEqual(["report_year", "report_season"]);
  });
});
