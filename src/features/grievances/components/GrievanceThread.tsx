"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/features/farmers";
import type { ThreadMessage } from "../types";
import { GrievanceStatusPill } from "./GrievancePills";

const AVATAR_COLORS: Record<ThreadMessage["kind"], string> = {
  submission: "bg-slate-700",
  "dept-response": "bg-success-ink",
  "status-change": "bg-subtle",
  "internal-note": "bg-orange-600",
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
        <span className="font-semibold text-ink">{author}</span>
        <span className="text-[12px] text-muted">· {role}</span>
        {tags}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[12px] text-muted">
        <span className="whitespace-nowrap">{at}</span>
        {collapsible && (
          <button type="button" onClick={onToggle} aria-label={isOpen ? "Collapse" : "Expand"} className="text-subtle hover:text-ink">
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
    <section className="rounded-xl border border-line bg-white">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4h12a2 2 0 012 2v7a2 2 0 01-2 2H9l-4 3v-3H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
            <path d="M20 8h1a2 2 0 012 2v7a2 2 0 01-2 2h-1v3l-4-3h-5a2 2 0 01-2-2v-1h8a3 3 0 003-3V8z" opacity=".6" />
          </svg>
        </span>
        <div>
          <h3 className="text-[16px] font-semibold text-ink">Comments &amp; Communication</h3>
          <p className="text-[12.5px] text-muted">{count} messages in this thread</p>
        </div>
      </header>

      <ol className="flex flex-col gap-4 px-4 py-4">
        {messages.map((m) => {
          if (m.kind === "status-change") {
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-1 text-[12px] text-muted">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-subtle">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
                <GrievanceStatusPill status={m.from} className="px-2 py-0 text-[11.5px]" />
                <svg className="h-3 w-3 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
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
                      tags={<Tag className="border-slate-200 bg-surface text-slate-600">Submission</Tag>}
                    />
                    {isOpen && (
                      <div className="mt-2 rounded-lg border border-line bg-surface px-4 py-3">
                        <p className="text-[13.5px] leading-relaxed text-ink">{m.body}</p>
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
                                      "inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1 text-[12px] text-slate-700 hover:border-brand-green/50",
                                      active ? "border-brand-green text-brand-green" : "border-line",
                                    )}
                                  >
                                    <svg className="h-3 w-3 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21.4 11.05l-9.2 9.2a6 6 0 01-8.5-8.5l9.2-9.2a4 4 0 015.7 5.7l-9.2 9.2a2 2 0 01-2.8-2.8l8.5-8.5" /></svg>
                                    {file}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                        {openFile?.messageId === m.id && (
                          <div className="mt-3 flex items-start gap-3 rounded-lg border border-line bg-white px-3.5 py-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-wash text-[10px] font-bold text-danger">
                              {(openFile.file.split(".").pop() ?? "FILE").toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1 text-[12.5px]">
                              <p className="truncate text-[13.5px] font-semibold text-ink">{openFile.file}</p>
                              <p className="mt-0.5 text-muted">Attached by {m.author} · {m.at}</p>
                              <p className="mt-1 text-muted">Evidence submitted with the grievance. The file is kept with the case record and opens in full once synced to this device.</p>
                            </div>
                            <button type="button" onClick={() => setOpenFile(null)} aria-label="Close preview" className="shrink-0 rounded p-0.5 text-subtle hover:text-ink">
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
                          <Tag className="border-brand-border bg-brand-mint text-brand-green">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zM5 10h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM12 2L2 7v2h20V7L12 2z" /></svg>
                            Dept Response #{m.responseNo}
                          </Tag>
                          <Tag className="border-blue-200 bg-blue-50 text-blue-700">{m.outcome}</Tag>
                        </>
                      }
                    />
                    {isOpen && (
                      <div className="mt-2 rounded-lg border border-brand-border-soft bg-brand-wash px-4 py-3 text-[13.5px] text-ink">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Action taken</p>
                        <p className="mt-1 leading-relaxed">{m.actionTaken}</p>
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Resolution summary</p>
                        <p className="mt-1 leading-relaxed">{m.resolutionSummary}</p>
                        <p className="mt-3 text-[12px] text-muted">Proposed closure: {m.proposedClosure}</p>
                      </div>
                    )}
                  </>
                )}

                {m.kind === "internal-note" && (
                  <>
                    <MessageHeader
                      author={m.author} role={m.role} at={m.at}
                      tags={
                        <Tag className="border-amber-200 bg-yellow-100 text-yellow-700">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17.9 17.9A10 10 0 016.1 6.1M9.9 4.2A10 10 0 0121.8 12a10 10 0 01-1.5 2.5M3 3l18 18" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></svg>
                          Internal Note
                        </Tag>
                      }
                    />
                    <div className="mt-2 rounded-lg border border-amber-200/60 bg-amber-50 px-4 py-3 text-[13.5px] leading-relaxed text-ink">
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
