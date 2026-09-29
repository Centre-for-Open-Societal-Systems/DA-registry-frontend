import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

export function Checkbox(props: CheckboxProps) {
  return (
    <span className="relative flex h-[18px] w-[18px] items-center justify-center">
      <input
        type="checkbox"
        className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[3px] border-2 border-subtle bg-white transition-colors checked:border-brand-green checked:bg-brand-green"
        {...props}
      />
      <svg
        className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}
