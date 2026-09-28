"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/features/farmers/data";
import type { ThreadMessage } from "../types";
import { GrievanceStatusPill } from "./GrievancePills";

const AVATAR_COLORS: Record<ThreadMessage["kind"], string> = {
  submission: "bg-[#334155]",
  "dept-response": "bg-[#0F5132]",
  "status-change": "bg-[#94A3B8]",
  "internal-note": "bg-[#EA580C]",
};

function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap", className)}>
      {children}
    </span>
  );
}

function MessageHeader({
  author,
  role,
  at,
  tags,
  collapsible,
  isOpen,
  onToggle,
}: {
  author: string;
  role: string;
  at: string;
  tags: React.ReactNode;
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  return (
    // Stacks on phones (timestamp under the author line); side by side from sm up
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-[13.5px]">
        <span className="font-semibold text-[#1a2b3c]">{author}</span>
        <span className="text-[12px] text-[#64748b]">· {role}</span>
        {tags}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[12px] text-[#64748b]">
        <span className="whitespace-nowrap">{at}</span>
        {collapsible && (
          <button type="button" onClick={onToggle} aria-label={isOpen ? "Collapse" : "Expand"} className="text-[#94A3B8] hover:text-[#1a2b3c]">
            <svg className={cn("h-3.5 w-3.5 transition-transform", !isOpen && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export function GrievanceThread({ messages }: { messages: ThreadMessage[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  // Attachment chip currently previewed inline (the thread already sits inside a modal).
  const [openFile, setOpenFile] = useState<{ messageId: string; file: string } | null>(null);
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = messages.filter((m) => m.kind !== "status-change").length;

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white">
      <header className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#4F46E5]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H9l-4 3v-3H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            <path d="M20 8h1a2 2 0 012 2v7a2 2 0 01-2 2h-1v3l-4-3h-5a2 2 0 01-2-2v-1h8a3 3 0 003-3V8z" opacity=".6" />
          </svg>
        </span>
        <div>
          <h3 className="text-[16px] font-semibold text-[#1a2b3c]">Comments &amp; Communication</h3>
          <p className="text-[12.5px] text-[#64748b]">{count} messages in this thread</p>
        </div>
      </header>

      <ol className="flex flex-col gap-4 px-4 py-4">
        {messages.map((m) => {
          if (m.kind === "status-change") {
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[12px] text-[#64748b]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
                <GrievanceStatusPill status={m.from} className="px-2 py-0 text-[11.5px]" />
                <svg className="h-3 w-3 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                <GrievanceStatusPill status={m.to} className="px-2 py-0 text-[11.5px]" />
                <span className="whitespace-nowrap">· by {m.by}</span>
                <span className="whitespace-nowrap">· {m.at}</span>
              </li>
            );
          }

          const isOpen = !collapsed.has(m.id);
          return (
            <li key={m.id} className="flex gap-3">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white", AVATAR_COLORS[m.kind])}>
                {getInitials(m.author)}
              </span>

              <div className="min-w-0 flex-1">
                {m.kind === "submission" && (
                  <>
                    <MessageHeader
                      author={m.author} role={m.role} at={m.at} collapsible isOpen={isOpen} onToggle={() => toggle(m.id)}
                      tags={<Tag className="border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]">Submission</Tag>}
                    />
                    {isOpen && (
                      <div className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                        <p className="text-[13.5px] leading-relaxed text-[#1a2b3c]">{m.body}</p>
                        {m.attachments.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {m.attachments.map((file) => {
                              const active = openFile?.messageId === m.id && openFile.file === file;
                              return (
                                <li key={file}>
                                  <button
                                    type="button"
                                    onClick={() => setOpenFile(active ? null : { messageId: m.id, file })}
                                    aria-pressed={active}
                                    aria-label={`${active ? "Hide" : "Preview"} attachment ${file}`}
                                    className={cn(
                                      "inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1 text-[12px] text-[#334155] hover:border-brand-green/50",
                                      active ? "border-brand-green text-brand-green" : "border-[#E5E7EB]",
                                    )}
                                  >
                                    <svg className="h-3 w-3 text-[#64748b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 11.05l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 015.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5" /></svg>
                                    {file}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {openFile?.messageId === m.id && (
                          <div className="mt-3 flex items-start gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF1F1] text-[10px] font-bold text-[#DC2626]">
                              {(openFile.file.split(".").pop() ?? "FILE").toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1 text-[12.5px]">
                              <p className="truncate text-[13.5px] font-semibold text-[#1a2b3c]">{openFile.file}</p>
                              <p className="mt-0.5 text-[#64748b]">Attached by {m.author} · {m.at}</p>
                              <p className="mt-1 text-[#64748b]">Evidence submitted with the grievance. The file is kept with the case record and opens in full once synced to this device.</p>
                            </div>
                            <button type="button" onClick={() => setOpenFile(null)} aria-label="Close preview" className="shrink-0 rounded p-0.5 text-[#94A3B8] hover:text-[#1a2b3c]">
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {m.kind === "dept-response" && (
                  <>
                    <MessageHeader
                      author={m.author} role={m.role} at={m.at} collapsible isOpen={isOpen} onToggle={() => toggle(m.id)}
                      tags={
                        <>
                          <Tag className="border-[#A7E3C7] bg-[#EBFAF2] text-brand-green">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zM5 10h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM12 2L2 7v2h20V7L12 2z" /></svg>
                            Dept Response #{m.responseNo}
                          </Tag>
                          <Tag className="border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]">{m.outcome}</Tag>
                        </>
                      }
                    />
                    {isOpen && (
                      <div className="mt-2 rounded-lg border border-[#C6EBD8] bg-[#F3FBF7] px-4 py-3 text-[13.5px] text-[#1a2b3c]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Action taken</p>
                        <p className="mt-1 leading-relaxed">{m.actionTaken}</p>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Resolution summary</p>
                        <p className="mt-1 leading-relaxed">{m.resolutionSummary}</p>
                        <p className="mt-3 text-[12px] text-[#64748b]">Proposed closure: {m.proposedClosure}</p>
                      </div>
                    )}
                  </>
                )}

                {m.kind === "internal-note" && (
                  <>
                    <MessageHeader
                      author={m.author} role={m.role} at={m.at}
                      tags={
                        <Tag className="border-[#FDE68A] bg-[#FEF9C3] text-[#A16207]">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.9 17.9A10 10 0 016.1 6.1M9.9 4.2A10 10 0 0121.8 12a10 10 0 01-1.5 2.5M3 3l18 18" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>
                          Internal Note
                        </Tag>
                      }
                    />
                    <div className="mt-2 rounded-lg border border-[#FDE68A]/60 bg-[#FFFBEB] px-4 py-3 text-[13.5px] leading-relaxed text-[#1a2b3c]">
                      {m.body}
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
