"use client";

import { useState } from "react";
import { RaiseGrievanceModal } from "@/features/grievances";

export function RaiseGrievanceButton({ farmerId, className }: { farmerId?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Raise grievance
      </button>
      {open && <RaiseGrievanceModal isOpen onClose={() => setOpen(false)} farmerId={farmerId} />}
    </>
  );
}
