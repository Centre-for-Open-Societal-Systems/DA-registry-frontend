"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { SendToFarmersModal } from "@/features/communication/components/SendToFarmersModal";
import type { Article } from "@/features/communication/data";

// Appendix C.5 Article detail: Send to farmers → snippet composer → Broadcast (FR-11).
export function ArticleView({ article }: { article: Article }) {
  const [sendOpen, setSendOpen] = useState(false);
  return (
    <div className="flex w-full flex-col gap-4">
      <Link href="/knowledge" className="inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-[#1a2b3c] transition-colors hover:text-brand-green">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to Knowledge Base
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="green">{article.category}</Pill>
            <span className="text-[12.5px] text-[#64748b]">{article.author} · updated {article.updatedAt} · {article.languages.includes("am") ? "English · Amharic" : "English"}</span>
          </div>
          <h1 className="mt-3 text-[24px] font-semibold leading-tight tracking-tight text-[#1a2b3c]">{article.title}</h1>
          <p className="mt-2 text-[15px] text-[#4a5568]">{article.summary}</p>
          <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-[#1a2b3c]">
            {article.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-[15px] font-semibold text-[#1a2b3c]">SMS-ready snippet</h2>
            <p className="mt-2 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-3 text-[13px] leading-relaxed text-[#1a2b3c]">{article.snippet}</p>
            <p className="mt-1.5 text-[12px] text-[#64748b]">{article.snippet.length} characters · {Math.ceil(article.snippet.length / 160)} segment{article.snippet.length > 160 ? "s" : ""}</p>
            <button type="button" onClick={() => setSendOpen(true)} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-green px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-green-dark">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
              Send to farmers
            </button>
            <p className="mt-2 text-center text-[12px] text-[#64748b]">Dispatched via the Broadcast engine and logged.</p>
          </Card>
          <Card className="shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-[15px] font-semibold text-[#1a2b3c]">Dissemination</h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
              <dt className="text-[#64748b]">Total sends</dt><dd className="text-right font-medium text-[#1a2b3c]">{article.sends}</dd>
              <dt className="text-[#64748b]">Last sent</dt><dd className="text-right font-medium text-[#1a2b3c]">{article.sends > 0 ? "12 Sep 2026" : "—"}</dd>
              <dt className="text-[#64748b]">Channels</dt><dd className="text-right font-medium text-[#1a2b3c]">SMS · Telegram</dd>
            </dl>
          </Card>
        </div>
      </div>

      {sendOpen && <SendToFarmersModal article={article} isOpen onClose={() => setSendOpen(false)} />}
    </div>
  );
}
