import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

// Toolbar search box (matches the FarmersTable search styling).
export function SearchInput({ value, onChange, placeholder = "Search…", className, id }: SearchInputProps) {
  return (
    <label className={cn("relative block", className)}>
      <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full text-ellipsis rounded-md border border-zinc-200 bg-[#F8FAFC] pl-9 pr-3 text-[13.5px] text-[#1a2b3c] placeholder:text-[#64748b] focus:border-brand-green focus:outline-none sm:w-[280px]"
      />
    </label>
  );
}
