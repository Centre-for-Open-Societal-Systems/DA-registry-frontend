"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { REGIONS } from "../locationData";

const ERROR_BORDER = "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]";

type GpsStatus = { tone: "muted" | "error"; text: string } | null;

const GEO_ERRORS: Record<number, string> = {
  1: "Location permission was denied. Allow location access in the browser, or type the coordinates (e.g. 9.0512, 37.2641).",
  2: "Your device couldn't determine a position. Try again outdoors, or type the coordinates manually.",
  3: "Locating timed out. Try again, or type the coordinates manually.",
};

/** `initial` restores a saved draft (field name → value). */
export function LocationStep({ initial = {} }: { initial?: Record<string, string> }) {
  const [region, setRegion] = useState(initial.region || REGIONS[0].name);
  const [zone, setZone] = useState(initial.zone || REGIONS[0].zones[0].name);
  const [woreda, setWoreda] = useState(initial.woreda || REGIONS[0].zones[0].woredas[0].name);
  const [kebele, setKebele] = useState(initial.kebele ?? "");
  const [gps, setGps] = useState(initial.gps ?? "");
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>(null);
  const [locating, setLocating] = useState(false);

  const locateDevice = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus({ tone: "error", text: "This device doesn't support GPS in the browser. Type the coordinates manually or leave blank to collect later." });
      return;
    }
    setLocating(true);
    setGpsStatus({ tone: "muted", text: "Locating…" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setGps(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setGpsStatus({ tone: "muted", text: `Captured from this device (accuracy ±${Math.round(pos.coords.accuracy)} m).` });
      },
      (err) => {
        setLocating(false);
        setGpsStatus({ tone: "error", text: GEO_ERRORS[err.code] ?? "Couldn't read your location. Type the coordinates manually or leave blank." });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

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
    <Card className="min-h-[480px] p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-[#E5E7EB] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Location and kebele</h2>
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

        <FormField label="Nearest landmark" htmlFor="landmark">
          <Input id="landmark" name="landmark" placeholder="Select nearest landmark..." />
        </FormField>

        <FormField
          label="GPS coordinates"
          htmlFor="gps"
          hint={gpsStatus?.text ?? (gps ? undefined : "Optional: Leave blank to collect later in the field.")}
          hintTone={gpsStatus?.tone ?? "error"}
        >
          <Input
            id="gps"
            name="gps"
            value={gps}
            onChange={(e) => {
              setGps(e.target.value);
              setGpsStatus(null);
            }}
            placeholder="Select gps coordinates..."
            className={gps ? undefined : ERROR_BORDER}
            endAdornment={
              <button
                type="button"
                title="Use current location"
                aria-label="Use current location"
                onClick={locateDevice}
                disabled={locating}
                className={`text-brand-green transition-colors hover:text-brand-green-dark disabled:opacity-50 ${locating ? "animate-pulse" : ""}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </button>
            }
          />
        </FormField>
      </form>
    </Card>
  );
}
