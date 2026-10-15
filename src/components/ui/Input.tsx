import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-bold text-zinc-700">
            {label}
          </label>
        )}
        <div className="relative">
          {startAdornment && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              {startAdornment}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-zinc-900 outline-none transition-all duration-150 placeholder:text-zinc-400 hover:border-brand-green hover:ring-1 hover:ring-brand-green/20 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:hover:border-gray-200 disabled:hover:ring-0",
              startAdornment && "pl-10",
              endAdornment && "pr-10",
              className,
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>
          )}
        </div>
      </div>
    );
  },
);

Input.displayName = "Input";
