"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { REGISTRY_TABS } from "../registrySpec";
import { RegistryStep } from "./RegistryStep";

const enumeratorTab = REGISTRY_TABS.find((tab) => tab.key === "enumerator")!;

const todayIso = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/** The enumerator is the signed-in agent, collecting today; the GPS readings come from this device. `initial` restores a saved draft. */
export function EnumeratorStep({ initial = {} }: { initial?: Record<string, string> }) {
  const user = useAuthStore((s) => s.user);
  const defaults = { enumerator_name: user?.name ?? "", enumerator_user_id: user?.id ?? "", data_collection_date: todayIso() };

  const notice = (
    <p className="flex items-start gap-2.5 rounded-lg border border-brand-border bg-brand-mint px-4 py-3 text-[13px] text-brand-green">
      <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
      Enumerator and device location are captured from your account and this device. Edit only if the data was collected by someone else.
    </p>
  );

  return <RegistryStep tab={enumeratorTab} initial={initial} defaults={defaults} leading={notice} />;
}
