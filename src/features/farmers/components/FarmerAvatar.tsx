import Image from "next/image";
import { cn } from "@/lib/utils";
import { getInitials } from "../data";

interface FarmerAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "lg";
  className?: string;
}

export function FarmerAvatar({ name, avatar, size = "sm", className }: FarmerAvatarProps) {
  const sizeClasses = size === "lg" ? "h-20 w-20 text-[28px]" : "h-8 w-8 text-[12px]";

  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={80}
        height={80}
        className={cn("shrink-0 rounded-full object-cover", sizeClasses, className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        size === "lg" ? "bg-brand-green text-white" : "bg-brand-tint text-brand-green",
        sizeClasses,
        className,
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
