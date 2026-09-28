"use client";

import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { ProfilePhotoUpload } from "@/features/farmers/components/ProfilePhotoUpload";
import { AGENT_PROFILE } from "@/features/farmers/agentProfile";

const [FIRST_NAME, ...REST] = AGENT_PROFILE.name.split(" ");

// Pre-filled with the signed-in agent's current profile until the profile API lands
const CURRENT_PROFILE = {
  photo: "/images/tadesse_profile.png",
  firstName: FIRST_NAME,
  lastName: REST.join(" "),
  mobile: AGENT_PROFILE.phone,
  email: AGENT_PROFILE.email,
  dob: "1998-05-15",
  gender: "male",
  idType: "national_id",
  idNumber: "3512 4498 7712",
  language: "en",
  lastUpdated: "2026-07-12",
};

const GENDERS: Record<string, string> = { male: "Male", female: "Female", other: "Other" };
const ID_TYPES: Record<string, string> = { national_id: "National ID (Fayda)", kebele_id: "Kebele ID", passport: "Passport", driving_license: "Driving License" };
const LANGUAGES: Record<string, string> = { en: "English", am: "Amharic", om: "Afaan Oromo", ti: "Tigrinya" };

// Identity fields come from Fayda and change only through re-verification; the rest can be requested here.
const EDITABLE = [
  { key: "mobile", label: "Mobile Phone" },
  { key: "email", label: "Email ID" },
  { key: "language", label: "Language" },
] as const;

type EditableKey = (typeof EDITABLE)[number]["key"];

const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] text-[#64748b]">{label}</dt>
      <dd className="mt-1 text-[14.5px] font-medium text-[#1a2b3c]">{value || "—"}</dd>
    </div>
  );
}

// Identity fields are verified via Fayda and can't be edited here — shown greyed out.
const LOCKED = "h-11 cursor-not-allowed border-zinc-200 bg-[#F8FAFC] text-[#1a2b3c] disabled:opacity-100";

function LockedField({ label, value, required }: { label: string; value: string; required?: boolean }) {
  const id = `locked-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <FormField label={label} htmlFor={id} required={required}>
      <Input id={id} value={value} readOnly disabled title="Verified via Fayda — changes need re-verification" className={LOCKED} />
    </FormField>
  );
}

interface DemographicsSectionProps {
  editing: boolean;
  onCancel: () => void;
  /** Called with the labels of the fields that changed. */
  onSubmit: (changed: string[]) => void;
}

export function DemographicsSection({ editing, onCancel, onSubmit }: DemographicsSectionProps) {
  const p = CURRENT_PROFILE;
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = (k: EditableKey) => String(data.get(k) ?? "").trim();
    const changed = EDITABLE.filter(({ key }) => value(key) !== p[key]).map(({ label }) => label);
    const photoChanged = (data.get("photo") as File | null)?.size ? ["Profile photo"] : [];
    const all = [...changed, ...photoChanged];

    if (all.length === 0) return setError("Change at least one field before submitting.");
    if (!/^\+?251\s?9\d(\s?\d){7}$/.test(value("mobile"))) return setError("Use an Ethiopian mobile number, e.g. +251 91 234 5678.");
    if (value("email") && !/^\S+@\S+\.\S+$/.test(value("email"))) return setError("Enter a valid email address.");

    setError(null);
    onSubmit(all);
  };

  const header = (
    <div className="border-b border-[#E5E7EB] px-6 py-3.5">
      <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Demographics &amp; personal details</h2>
      <p className="mt-1 text-[12.5px] text-[#4a5568]">
        {editing ? "Editing - changes are sent to your Woreda supervisor for approval" : "Your identity details"}
      </p>
    </div>
  );

  if (editing) {
    return (
      <form className="flex animate-fade-in flex-col gap-6" onSubmit={submit} onChange={() => setError(null)}>
        <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          {header}
          <div className="flex flex-col gap-6 px-6 py-5">
            {error && <Banner tone="error">{error}</Banner>}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[215px_1fr] lg:gap-10">
              <ProfilePhotoUpload initialPreview={p.photo} name="photo" showActions={false} />

              <div className="grid grid-cols-1 content-start gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                <LockedField label="First Name" value={p.firstName} required />
                <LockedField label="Last Name" value={p.lastName} required />
                <FormField label="Mobile Phone" htmlFor="mobile">
                  <Input id="mobile" name="mobile" type="tel" defaultValue={p.mobile} className="h-11" />
                </FormField>

                <FormField label="Email ID" htmlFor="email">
                  <Input id="email" name="email" type="email" defaultValue={p.email} className="h-11" />
                </FormField>
                <LockedField label="Date of Birth" value={formatDate(p.dob)} required />
                <FormField label="Gender" htmlFor="locked-gender" required>
                  <Select id="locked-gender" value={p.gender} disabled title="Verified via Fayda — changes need re-verification" className={LOCKED}>
                    {Object.entries(GENDERS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </FormField>

                <LockedField label="ID Type" value={ID_TYPES[p.idType]} />
                <LockedField label="ID Number" value={p.idNumber} />
                <FormField label="Language" htmlFor="language">
                  <Select id="language" name="language" defaultValue={p.language} className="h-11">
                    {Object.entries(LANGUAGES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                </FormField>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#64748b]">Last updated profile changes: {formatDate(p.lastUpdated).replace(/^0/, "")}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => { setError(null); onCancel(); }}>Cancel</Button>
            <Button type="submit" variant="brand">Save Changes</Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      {header}
      <div className="grid animate-fade-in grid-cols-1 gap-6 px-5 py-5 lg:grid-cols-[215px_1fr] lg:gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-[#64748b]">Profile Photo</span>
          <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-200">
            {/* Static sample photo; next/image adds nothing for a single avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.photo} alt={`${AGENT_PROFILE.name} profile photo`} className="h-full w-full object-cover" />
          </div>
        </div>

        <dl className="grid grid-cols-1 content-start gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
          <ReadOnlyValue label="First Name" value={p.firstName} />
          <ReadOnlyValue label="Last Name" value={p.lastName} />
          <ReadOnlyValue label="Mobile Phone" value={p.mobile} />
          <ReadOnlyValue label="Email ID" value={p.email} />
          <ReadOnlyValue label="Date of Birth" value={formatDate(p.dob)} />
          <ReadOnlyValue label="Gender" value={GENDERS[p.gender]} />
          <ReadOnlyValue label="ID Type" value={ID_TYPES[p.idType]} />
          <ReadOnlyValue label="ID Number" value={p.idNumber} />
          <ReadOnlyValue label="Language" value={LANGUAGES[p.language]} />
        </dl>
      </div>
    </Card>
  );
}
