"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { ProfilePhotoUpload } from "@/features/farmers";
import { cn } from "@/lib/utils";
import { isFieldVisible, type RegistryField, type RegistrySection, type RegistryTab } from "../registrySpec";

const INPUT_TYPE = { text: "text", number: "number", date: "date", tel: "tel", select: "text", radio: "text", checkbox: "text", textarea: "text", file: "text", derived: "text", capture: "text" } as const;

// Filled in by the registry once the record exists; the agent only sees them here.
const RECORD_FIELDS = ["Farmer ID", "Record Name", "Status", "Status Reason", "Created By", "Created At", "Last Approved By", "Last Approved At"];

const CALENDAR_ICON = (
  <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </svg>
);

const UPLOAD_ICON = "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12";

const GRID = { 3: "md:grid-cols-2 xl:grid-cols-3", 4: "md:grid-cols-2 xl:grid-cols-4" } as const;

// A file picker that looks like the other inputs; only the file's name goes into the draft.
function FileInput({ field, value, onChange }: { field: RegistryField; value: string; onChange: (value: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input type="hidden" name={field.name} value={value} readOnly />
      <button
        type="button"
        id={field.name}
        onClick={() => inputRef.current?.click()}
        className="flex h-11 w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm outline-none transition-all duration-150 hover:border-brand-green hover:ring-1 hover:ring-brand-green/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
      >
        <svg className="h-4 w-4 shrink-0 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={UPLOAD_ICON} />
        </svg>
        <span className={cn("truncate", value ? "text-zinc-900" : "text-zinc-400")}>{value || `Enter ${field.label}`}</span>
      </button>
      <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png" className="hidden" onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")} />
    </>
  );
}

function Field({ field, value, values, enabled, onChange, endAdornment }: { field: RegistryField; value: string; values: Record<string, string>; enabled: boolean; onChange: (value: string) => void; endAdornment?: ReactNode }) {
  const label = field.label;
  const wide = field.wide ? "col-span-full" : undefined;
  const common = { label, htmlFor: field.name, required: field.required, hint: field.hint, className: wide };

  if (field.type === "radio") {
    const selected = value || field.options?.[0] || "";
    return (
      <FormField {...common}>
        {/* The hidden input carries the choice into the draft; the radios themselves are display only. */}
        <input type="hidden" id={field.name} name={field.name} value={selected} readOnly />
        <div role="radiogroup" aria-label={label} className="flex h-11 items-center gap-6">
          {field.options?.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input type="radio" checked={selected === option} onChange={() => onChange(option)} className="h-4 w-4 accent-brand-green" />
              {option}
            </label>
          ))}
        </div>
      </FormField>
    );
  }
  if (field.type === "derived") {
    const result = field.derive?.(values) ?? "";
    return (
      <FormField {...common}>
        <input type="hidden" id={field.name} name={field.name} value={result} readOnly />
        <label className="flex h-11 items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={result === "Yes"} disabled readOnly className="h-[18px] w-[18px] accent-brand-green" />
          Derived from upload
        </label>
      </FormField>
    );
  }
  if (field.type === "file") {
    return (
      <FormField {...common}>
        <FileInput field={field} value={value} onChange={onChange} />
      </FormField>
    );
  }
  if (field.type === "textarea") {
    return (
      <FormField {...common}>
        <Textarea id={field.name} name={field.name} rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Optional note" />
      </FormField>
    );
  }
  return (
    <FormField {...common}>
      {field.type === "select" ? (
        <Select id={field.name} name={field.name} value={value} disabled={!enabled} onChange={(e) => onChange(e.target.value)}>
          <option value="" disabled>{field.placeholder ?? `Select ${label}`}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </Select>
      ) : (
        <Input
          id={field.name}
          name={field.name}
          type={INPUT_TYPE[field.type]}
          value={field.derive ? field.derive(values) : value}
          readOnly={!!field.derive}
          disabled={!enabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder ?? (field.type === "tel" ? "+251 9XXXXXXXX" : `Enter ${label}`)}
          startAdornment={field.type === "date" || (field.name.includes("date_ec") && !field.derive) ? CALENDAR_ICON : undefined}
          endAdornment={endAdornment}
        />
      )}
    </FormField>
  );
}

const PIN_ICON = "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 13a3 3 0 100-6 3 3 0 000 6z";

// Grey title bar with a chevron that folds the section away; open by default.
export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white shadow-card">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 bg-surface px-5 py-3 text-left">
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold text-ink">{title}</span>
          {description && <span className="mt-0.5 block text-[12.5px] text-ink-soft">{description}</span>}
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink-soft">
          <svg className={cn("h-4 w-4 transition-transform", open && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      {/* Hidden, not unmounted, so a folded section's values still reach the draft. */}
      <div className={cn("border-t border-line px-5 py-5", !open && "hidden")}>{children}</div>
    </section>
  );
}

function RecordSection() {
  return (
    <Section title="Profile and Record Details" description="Manage the profile photo and view auto-filled record details.">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        <ProfilePhotoUpload />
        <div className="grid grid-cols-1 content-start gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          {RECORD_FIELDS.map((label) => (
            <FormField key={label} label={label} htmlFor={`record-${label}`} required>
              <Input id={`record-${label}`} readOnly placeholder={`Enter ${label}`} />
            </FormField>
          ))}
        </div>
      </div>
    </Section>
  );
}

type Setter = (name: string) => (value: string) => void;

/** Reads the device position into the latitude / longitude fields; the enumerator's also get altitude, accuracy and the capture time. */
function readDevicePosition(onChange: Setter, prefix: "" | "enumerator_", done?: (ok: boolean) => void) {
  if (!("geolocation" in navigator)) return done?.(false);
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      onChange(`${prefix}latitude`)(coords.latitude.toFixed(prefix ? 6 : 4));
      onChange(`${prefix}longitude`)(coords.longitude.toFixed(prefix ? 6 : 4));
      if (prefix) {
        onChange("enumerator_altitude")(coords.altitude === null ? "" : `${Math.round(coords.altitude).toLocaleString("en-US")} m`);
        onChange("enumerator_accuracy")(`± ${coords.accuracy.toFixed(1)} m`);
        onChange("enumerator_gps_captured_at")(new Date().toISOString());
      }
      done?.(true);
    },
    () => done?.(false),
  );
}

const capturedLabel = (iso: string) => {
  const at = new Date(iso);
  const time = at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return at.toDateString() === new Date().toDateString() ? `today at ${time}` : `${at.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} at ${time}`;
};

// Fills the enumerator's GPS readings from the device when the step opens, and again on request.
function GpsCapture({ values, onChange }: { values: Record<string, string>; onChange: Setter }) {
  const [failed, setFailed] = useState(false);
  const capture = () => readDevicePosition(onChange, "enumerator_", (ok) => setFailed(!ok));
  useEffect(() => {
    // Skipped when a reading is already there (a restored draft).
    if (!values.enumerator_latitude) capture();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on open
  }, []);
  const at = values.enumerator_gps_captured_at;
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-2 self-end md:col-span-2">
      <input type="hidden" name="enumerator_gps_captured_at" value={at ?? ""} readOnly />
      <button type="button" onClick={capture} className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-[13.5px] font-medium text-ink transition-colors hover:bg-surface">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={PIN_ICON} />
        </svg>
        Recapture location
      </button>
      <span className="text-[12.5px] text-muted">{failed ? "Location unavailable. Enter the readings manually." : at ? `Last captured ${capturedLabel(at)}` : "Not captured yet"}</span>
    </div>
  );
}

// Consecutive checkboxes share one cell under the heading of the first, e.g. "Members included".
function CheckboxGroup({ fields, values, onChange }: { fields: RegistryField[]; values: Record<string, string>; onChange: (name: string) => (value: string) => void }) {
  return (
    <FormField label={fields[0].group ?? fields[0].label} htmlFor={fields[0].name}>
      <div className="flex h-11 flex-wrap items-center gap-x-6 gap-y-2">
        {fields.map((field) => {
          const checked = (values[field.name] ?? "Yes") === "Yes";
          return (
            <label key={field.name} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              {/* The hidden input carries the answer into the draft; the checkbox itself is display only. */}
              <input type="hidden" id={field.name} name={field.name} value={checked ? "Yes" : "No"} readOnly />
              <input type="checkbox" checked={checked} onChange={(e) => onChange(field.name)(e.target.checked ? "Yes" : "No")} className="h-[18px] w-[18px] accent-brand-green" />
              {field.label}
            </label>
          );
        })}
      </div>
    </FormField>
  );
}

function SectionFields({ section, values, onChange }: { section: RegistrySection; values: Record<string, string>; onChange: (name: string) => (value: string) => void }) {
  // Fold each run of checkboxes into one cell.
  const cells: RegistryField[][] = [];
  for (const field of section.fields) {
    const last = cells[cells.length - 1];
    if (field.type === "checkbox" && last?.[0].type === "checkbox") last.push(field);
    else cells.push([field]);
  }
  // The pin fills the device's coordinates, when it allows location access.
  const pinFor = (field: RegistryField) => (
    <button
      type="button"
      onClick={() => readDevicePosition(onChange, field.name.startsWith("enumerator_") ? "enumerator_" : "")}
      aria-label="Use my current location"
      title="Use my current location"
      className="text-zinc-400 transition-colors hover:text-brand-green"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={PIN_ICON} />
      </svg>
    </button>
  );
  return (
    <div className={cn("grid grid-cols-1 content-start gap-x-6 gap-y-5", GRID[section.columns ?? 3])}>
      {cells.map((cell) =>
        cell[0].type === "checkbox" ? (
          <CheckboxGroup key={cell[0].name} fields={cell} values={values} onChange={onChange} />
        ) : cell[0].type === "capture" ? (
          <GpsCapture key={cell[0].name} values={values} onChange={onChange} />
        ) : (
          <Field key={cell[0].name} field={cell[0]} value={values[cell[0].name] ?? cell[0].defaultValue ?? ""} values={values} enabled={isFieldVisible(cell[0], values)} onChange={onChange(cell[0].name)} endAdornment={cell[0].locate ? pinFor(cell[0]) : undefined} />
        ),
      )}
    </div>
  );
}

/** One Farmer Registry tab as collapsible sections. `initial` restores a saved draft (field name → value), `defaults` fill what it leaves empty; `leading` sits above the sections. */
export function RegistryStep({ tab, initial = {}, defaults, leading }: { tab: RegistryTab; initial?: Record<string, string>; defaults?: Record<string, string>; leading?: ReactNode }) {
  // `defaults` fill the fields a draft has nothing in (e.g. the signed-in enumerator).
  const [values, setValues] = useState(() => {
    const merged = { ...initial };
    for (const [name, value] of Object.entries(defaults ?? {})) if (!merged[name]) merged[name] = value;
    return merged;
  });
  const set = (name: string) => (value: string) => setValues((current) => ({ ...current, [name]: value }));

  const sections = (
    <div className="flex flex-col gap-5">
      {tab.key === "farmer" && <RecordSection />}
      {leading}
      {tab.sections.map((section) => (
        <Section key={section.title} title={section.title} description={section.description}>
          <SectionFields section={section} values={values} onChange={set} />
        </Section>
      ))}
    </div>
  );

  // Steps without a heading (Location, which adds its own hierarchy card) keep the bare sections.
  if (!tab.heading) return sections;
  return (
    <Card className="p-0 shadow-card">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h2 className="text-[18px] font-bold text-ink">{tab.heading.title}</h2>
        <p className="mt-0.5 text-[12.5px] text-ink-soft">{tab.heading.description}</p>
      </div>
      <div className="px-4 py-5 sm:px-5">{sections}</div>
    </Card>
  );
}
