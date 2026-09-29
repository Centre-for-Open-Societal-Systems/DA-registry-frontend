"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

interface IssueSubmittedModalProps {
  issueId: string | null;
  supervisorName: string;
  onClose: () => void;
}

export function IssueSubmittedModal({ issueId, supervisorName, onClose }: IssueSubmittedModalProps) {
  const isOpen = issueId !== null;
  // Portals need document, so render nothing until mounted on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-submitted-title"
        className="flex w-full max-w-[420px] flex-col items-center rounded-2xl bg-white px-8 pb-8 pt-10 text-center shadow-2xl"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-tint text-brand-green">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>

        <h2 id="issue-submitted-title" className="mt-5 text-[20px] font-semibold text-ink">
          Issue submitted
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          {issueId} has been sent to your supervisor ({supervisorName}) and the support desk. You&apos;ll be notified when
          it&apos;s triaged and assigned.
        </p>

        <Button type="button" variant="brand" onClick={onClose} autoFocus className="mt-6 w-[120px]">
          Done
        </Button>
      </div>
    </div>,
    document.body,
  );
}
