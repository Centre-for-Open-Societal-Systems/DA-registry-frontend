import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "brand" | "brandOutline" | "danger" | "dangerOutline";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-zinc-900 text-white hover:bg-zinc-700",
  secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
  outline: "border border-zinc-200 bg-white text-ink hover:bg-zinc-50",
  ghost: "text-zinc-900 hover:bg-zinc-100",
  brand: "bg-brand-green font-bold text-white hover:bg-brand-green-dark",
  brandOutline: "border border-brand-green bg-white font-semibold text-brand-green hover:bg-brand-wash",
  danger: "bg-danger font-semibold text-white hover:bg-red-700",
  dangerOutline: "border border-danger bg-white font-semibold text-danger hover:bg-danger-wash",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
