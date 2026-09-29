"use client";

import { QUICK_FILTERS } from "./planVisit";

interface FarmerSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

// Farmer search box and the (fixed) quick filters.
export function FarmerSearch({ query, onQueryChange, onSearch }: FarmerSearchProps) {
  return (
    <>
      <div className="flex gap-2.5">
        <label className="relative block flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              // Enter searches instead of submitting the visit form.
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch();
              }
            }}
            aria-label="Search farmers"
            placeholder="Search name, phone, kebele..."
            className="h-10 w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-3 text-[14px] text-ink placeholder:text-muted focus:border-brand-green focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={onSearch}
          className="h-10 shrink-0 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-ink transition-colors hover:bg-zinc-50"
        >
          Search
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_FILTERS.map((label) => (
          <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-[12.5px] text-ink">
            <svg className="h-3.5 w-3.5 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 13l4 4L19 7" />
            </svg>
            {label}
          </span>
        ))}
      </div>
    </>
  );
}
