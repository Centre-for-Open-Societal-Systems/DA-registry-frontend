"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/useAuthStore";
import { ARTICLE_CATEGORIES, ARTICLES, type Article } from "@/features/communication/data";
import { matchesQuery } from "@/lib/search";
import { cn } from "@/lib/utils";

// Appendix C.5 Knowledge Base: content hub (knowledge + advisory merged) — categories, search, Create snippet, item → article.
export function KnowledgeHub() {
  const role = useAuthStore((s) => s.role);
  const canCreate = role === "CommsOfficer" || role === "Admin" || role === "Supervisor";
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<{ title: string; category: Article["category"]; snippet: string }>({ title: "", category: ARTICLE_CATEGORIES[0], snippet: "" });
  const [notice, setNotice] = useState<string | null>(null);

  const visible = useMemo(() => {
    return articles.filter((a) => (!category || a.category === category) && matchesQuery(query, a));
  }, [articles, category, query]);

  const create = () => {
    const id = `kb-${106 + articles.length - ARTICLES.length}`;
    setArticles((prev) => [{ id, title: draft.title, category: draft.category, summary: draft.snippet, body: [draft.snippet], snippet: draft.snippet, languages: ["en"], updatedAt: "Just now", author: "You", sends: 0 }, ...prev]);
    setCreateOpen(false);
    setDraft({ title: "", category: ARTICLE_CATEGORIES[0], snippet: "" });
    setNotice(`Snippet “${draft.title}” created. Open it to send to farmers via SMS / Telegram.`);
  };

  return (
    <>
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory("")} className={cn("h-8 rounded-full border px-3 text-[13px] font-medium transition-colors", !category ? "border-brand-green bg-[#F0FAF5] text-brand-green" : "border-zinc-200 bg-white text-[#4a5568] hover:bg-zinc-50")}>All</button>
            {ARTICLE_CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c === category ? "" : c)} className={cn("h-8 rounded-full border px-3 text-[13px] font-medium transition-colors", category === c ? "border-brand-green bg-[#F0FAF5] text-brand-green" : "border-zinc-200 bg-white text-[#4a5568] hover:bg-zinc-50")}>{c}</button>
            ))}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <SearchInput value={query} onChange={setQuery} placeholder="Search articles…" />
            {canCreate && <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark">Create snippet</button>}
          </div>
        </div>
      </Card>

      {visible.length === 0 ? (
        <Card><EmptyState title="No articles match" hint="Try another category or search term." /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((a) => (
            <Link key={a.id} href={`/knowledge/${a.id}`} className="flex flex-col rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] transition-all hover:border-brand-green/30 hover:shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <Pill tone="green">{a.category}</Pill>
                <span className="text-[12px] text-[#64748b]">{a.languages.includes("am") ? "EN · አማ" : "EN"}</span>
              </div>
              <h3 className="mt-3 text-[15.5px] font-semibold leading-snug text-[#1a2b3c]">{a.title}</h3>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-[#4a5568]">{a.summary}</p>
              <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-[#64748b]">
                <span className="min-w-0">{a.author} · <span className="whitespace-nowrap">{a.updatedAt}</span></span>
                <span className="shrink-0 whitespace-nowrap font-medium text-brand-green">{a.sends} sends</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create snippet" subtitle="A short, SMS-ready knowledge snippet farmers can act on" size="lg"
        footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="brand" disabled={draft.title.trim().length < 3 || draft.snippet.trim().length < 10} onClick={create}>Create</Button></>}
      >
        <div className="flex flex-col gap-4">
          <FormField label="Title" htmlFor="kb-title" required><Input id="kb-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></FormField>
          <FormField label="Category" htmlFor="kb-cat" required><Select id="kb-cat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Article["category"] })}>{ARTICLE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></FormField>
          <FormField label="Snippet" htmlFor="kb-snippet" required hint={`${draft.snippet.length} characters · keep to 160 for one SMS segment`}><Textarea id="kb-snippet" rows={4} value={draft.snippet} onChange={(e) => setDraft({ ...draft, snippet: e.target.value })} /></FormField>
        </div>
      </Modal>
    </>
  );
}
