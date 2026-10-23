"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { REGIONS } from "../locationData";
import { REGISTRY_TABS } from "../registrySpec";
import { RegistryStep, Section } from "./RegistryStep";

const locationTab = REGISTRY_TABS.find((tab) => tab.key === "location")!;

/** `initial` restores a saved draft (field name → value). */
export function LocationStep({ initial = {} }: { initial?: Record<string, string> }) {
  const [region, setRegion] = useState(initial.region ?? "");
  const [zone, setZone] = useState(initial.zone ?? "");
  const [woreda, setWoreda] = useState(initial.woreda ?? "");
  const [kebele, setKebele] = useState(initial.kebele ?? "");

  const zones = REGIONS.find((r) => r.name === region)?.zones ?? [];
  const woredas = zones.find((z) => z.name === zone)?.woredas ?? [];
  const kebeles = woredas.find((w) => w.name === woreda)?.kebeles ?? [];

  // Each level resets everything below it so stale selections don't linger
  const handleRegionChange = (value: string) => {
    setRegion(value);
    setZone("");
    setWoreda("");
    setKebele("");
  };

  const handleZoneChange = (value: string) => {
    setZone(value);
    setWoreda("");
    setKebele("");
  };

  const handleWoredaChange = (value: string) => {
    setWoreda(value);
    setKebele("");
  };

  const path = [region, zone, woreda, kebele].filter(Boolean).join(" › ");

  const hierarchy = (
    <>
      <Section title="Administrative Location" description="Select the region, zone, woreda and kebele from the location hierarchy.">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[14px] font-semibold text-ink">Location hierarchy</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-blue-700">One cascading selection</span>
          </div>
          {path && (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-brand-green">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              {path}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Region" htmlFor="region" required>
            <Select id="region" name="region" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
              <option value="" disabled>Select Region</option>
              {REGIONS.map((r) => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Zone" htmlFor="zone" required>
            <Select id="zone" name="zone" value={zone} disabled={!region} onChange={(e) => handleZoneChange(e.target.value)}>
              <option value="" disabled>Select Zone</option>
              {zones.map((z) => (
                <option key={z.name} value={z.name}>{z.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Woreda" htmlFor="woreda" required>
            <Select id="woreda" name="woreda" value={woreda} disabled={!zone} onChange={(e) => handleWoredaChange(e.target.value)}>
              <option value="" disabled>Select Woreda</option>
              {woredas.map((w) => (
                <option key={w.name} value={w.name}>{w.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Kebele" htmlFor="kebele" required>
            <Select id="kebele" name="kebele" value={kebele} disabled={!woreda} onChange={(e) => setKebele(e.target.value)}>
              <option value="" disabled>Select Kebele</option>
              {kebeles.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
          </FormField>
        </div>
      </Section>

      <p className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] text-blue-700">
        <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        Region, Zone, Woreda and Kebele are chosen as one hierarchy. The four names below are saved as read-only projections of the selected level.
      </p>
    </>
  );

  return <RegistryStep tab={locationTab} initial={initial} leading={hierarchy} />;
}
