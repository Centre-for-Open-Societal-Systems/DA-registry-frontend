"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { REGIONS } from "../locationData";
import { REGISTRY_TABS } from "../registrySpec";
import { RegistryStep } from "./RegistryStep";

const locationTab = REGISTRY_TABS.find((tab) => tab.key === "location")!;

const ERROR_BORDER = "border-danger focus:border-danger focus:ring-danger";

/** `initial` restores a saved draft (field name → value). */
export function LocationStep({ initial = {} }: { initial?: Record<string, string> }) {
  const [region, setRegion] = useState(initial.region || REGIONS[0].name);
  const [zone, setZone] = useState(initial.zone || REGIONS[0].zones[0].name);
  const [woreda, setWoreda] = useState(initial.woreda || REGIONS[0].zones[0].woredas[0].name);
  const [kebele, setKebele] = useState(initial.kebele ?? "");

  const zones = REGIONS.find((r) => r.name === region)?.zones ?? [];
  const woredas = zones.find((z) => z.name === zone)?.woredas ?? [];
  const kebeles = woredas.find((w) => w.name === woreda)?.kebeles ?? [];

  // Each level resets everything below it so stale selections don't linger
  const handleRegionChange = (value: string) => {
    setRegion(value);
    const firstZone = REGIONS.find((r) => r.name === value)?.zones[0];
    setZone(firstZone?.name ?? "");
    setWoreda(firstZone?.woredas[0]?.name ?? "");
    setKebele("");
  };

  const handleZoneChange = (value: string) => {
    setZone(value);
    setWoreda(zones.find((z) => z.name === value)?.woredas[0]?.name ?? "");
    setKebele("");
  };

  const handleWoredaChange = (value: string) => {
    setWoreda(value);
    setKebele("");
  };

  return (
    <div className="flex flex-col gap-4">
    <Card className="p-0 shadow-card">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">Location Hierarchy</h2>
      </div>

      <form className="grid grid-cols-1 gap-x-6 gap-y-5 px-5 py-5 md:grid-cols-2 xl:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        <FormField label="Region" htmlFor="region" required>
          <Select id="region" name="region" value={region} onChange={(e) => handleRegionChange(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Zone" htmlFor="zone" required>
          <Select id="zone" name="zone" value={zone} onChange={(e) => handleZoneChange(e.target.value)}>
            {zones.map((z) => (
              <option key={z.name} value={z.name}>{z.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Woreda" htmlFor="woreda" required>
          <Select id="woreda" name="woreda" value={woreda} onChange={(e) => handleWoredaChange(e.target.value)}>
            {woredas.map((w) => (
              <option key={w.name} value={w.name}>{w.name}</option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Kebele"
          htmlFor="kebele"
          required
          hint={kebele ? undefined : "Select a kebele to continue"}
          hintTone="error"
        >
          <Select
            id="kebele"
            name="kebele"
            value={kebele}
            onChange={(e) => setKebele(e.target.value)}
            className={kebele ? undefined : ERROR_BORDER}
          >
            <option value="" disabled>Select kebele...</option>
            {kebeles.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </Select>
        </FormField>

      </form>
    </Card>
    <RegistryStep tab={locationTab} initial={initial} />
    </div>
  );
}
