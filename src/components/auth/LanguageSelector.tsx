"use client";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
];

export function LanguageSelector() {
  return (
    <select
      aria-label="Language"
      defaultValue="en"
      className="rounded-md border border-white/30 bg-transparent px-2 py-1 text-sm text-white"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code} className="text-zinc-900">
          {lang.label}
        </option>
      ))}
    </select>
  );
}
