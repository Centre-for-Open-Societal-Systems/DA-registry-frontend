"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

// Approve & publish — success confirmation.
export function PublishedModal({ count, onClose }: { count: number | null; onClose: () => void }) {
  return (
    <Modal
      isOpen={count !== null}
      onClose={onClose}
      title="Approved & Published"
      hideHeader
      bodyClassName="px-6 pb-6 pt-8"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Link
            href="/agents"
            className="inline-flex h-10 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-brand-green px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark sm:flex-none"
          >
            View in registry
          </Link>
        </>
      }
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 animate-check-pop items-center justify-center rounded-full bg-brand-tint text-brand-green">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <h2 id="modal-title" className="mt-5 text-[20px] font-semibold text-ink">Approved &amp; Published</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          {count === 1 ? "The selected record has" : `${count} selected records have`} been approved and published to Ethiopia&apos;s master DA Registry (MoA). Field teams and the Woreda office will see the updated records immediately.
        </p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-mint px-3.5 py-1 text-[13px] font-semibold text-brand-green">
          <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
          {count} of {count} published · 0 failed
        </span>
      </div>
    </Modal>
  );
}
