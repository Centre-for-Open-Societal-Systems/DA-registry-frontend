"use client";

import { useState } from "react";
import { SendToFarmersModal } from "@/features/communication";
import type { Article } from "@/features/communication";

// Send to farmers → snippet composer → Broadcast (FR-11).
export function SendToFarmersButton({ article }: { article: Article }) {
  const [sendOpen, setSendOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setSendOpen(true)} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-green px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
        Send to farmers
      </button>
      {sendOpen && <SendToFarmersModal article={article} isOpen onClose={() => setSendOpen(false)} />}
    </>
  );
}
