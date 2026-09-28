"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/lib/utils";
import type { TodaysVisit } from "@/features/visits/types";

type GpsState = { status: "idle" | "locating" } | { status: "ok"; label: string } | { status: "unavailable" };

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Start visit = check in at the farm: record arrival time and GPS, confirm the farmer is present,
// then continue to the outcome form for this visit. Works offline — the check-in is queued with the visit.
export function StartVisitButton({ visitId, next }: { visitId: string; next: TodaysVisit | undefined }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [arrivedAt, setArrivedAt] = useState("");
  const [gps, setGps] = useState<GpsState>({ status: "idle" });
  const [farmerPresent, setFarmerPresent] = useState(false);

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGps({ status: "unavailable" });
      return;
    }
    setGps({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ status: "ok", label: `${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}° · ±${Math.round(pos.coords.accuracy)} m` }),
      () => setGps({ status: "unavailable" }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const open = () => {
    setArrivedAt(now());
    setFarmerPresent(false);
    setIsOpen(true);
    locate();
  };

  const start = () => {
    const params = new URLSearchParams({ started: arrivedAt, farmer: next?.farmerName ?? "" });
    if (gps.status === "ok") params.set("gps", "1");
    router.push(`/visits/${visitId}/outcome?${params.toString()}`);
  };

  if (!next) {
    return (
      <Banner tone="success" className="text-center font-medium">
        All of today&apos;s visits are done.
      </Banner>
    );
  }

  return (
    <>
      <Button type="button" variant="brand" onClick={open} className="w-full gap-2">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8V4z" /></svg>
        Start visit · {next.farmerName}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Start visit"
        subtitle={`${next.farmerName} · planned arrival ${next.plannedArrival}`}
        bodyClassName="px-4 py-4 sm:px-6"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="sm:mr-auto">
              Cancel
            </Button>
            <Button variant="brand" onClick={start} disabled={!farmerPresent || gps.status === "locating"} className="gap-2">
              Check in &amp; log outcome
            </Button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-[#4a5568]">
          Starting a visit checks you in at the farm. The arrival time and location are saved with the visit, and you then record what happened on the outcome form.
        </p>

        <ul className="mt-4 divide-y divide-[#E5E7EB] rounded-lg border border-[#E5E7EB]">
          <li className="flex items-center justify-between gap-4 px-4 py-3 text-[14px]">
            <span className="text-[#4a5568]">Arrival time</span>
            <span className="font-semibold text-[#1a2b3c]">{arrivedAt}</span>
          </li>
          <li className="flex items-center justify-between gap-4 px-4 py-3 text-[14px]">
            <span className="text-[#4a5568]">GPS location</span>
            <span className={cn("text-right font-semibold", gps.status === "ok" ? "text-brand-green" : gps.status === "unavailable" ? "text-[#B45309]" : "text-[#64748b]")}>
              {gps.status === "ok" && gps.label}
              {gps.status === "locating" && <span className="animate-pulse">Locating…</span>}
              {gps.status === "idle" && "—"}
              {gps.status === "unavailable" && (
                <>
                  Not available — farmer&apos;s parcel location will be used{" "}
                  <button type="button" onClick={locate} className="ml-1 font-semibold text-brand-green underline">Retry</button>
                </>
              )}
            </span>
          </li>
          <li className="flex items-center justify-between gap-4 px-4 py-3 text-[14px]">
            <span className="text-[#4a5568]">Planned arrival</span>
            <span className="font-semibold text-[#1a2b3c]">{next.plannedArrival} · {next.note}</span>
          </li>
        </ul>

        <label className="mt-4 flex cursor-pointer items-start gap-3 text-[13.5px] text-[#1a2b3c]">
          <span className="pt-0.5"><Checkbox checked={farmerPresent} onChange={(e) => setFarmerPresent(e.target.checked)} /></span>
          I am at the farm and {next.farmerName} is present for this visit.
        </label>

        <Banner tone="warning" className="mt-4">
          No connection? The check-in is saved on this device and syncs when you are back online.
        </Banner>
      </Modal>
    </>
  );
}
