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
import { ARTICLE_CATEGORIES, ARTICLES, type Article } from "@/features/communication";
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
      <Card className="p-0 shadow-card">
        {/* Category tabs, with search and Create snippet at the right end of the bar */}
        <div className="flex flex-col gap-3 border-b border-line xl:flex-row xl:items-center xl:justify-between">
          <div role="tablist" aria-label="Category" className="flex overflow-x-auto rounded-tl-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["", ...ARTICLE_CATEGORIES].map((c) => {
              const active = category === c;
              return (
                <button
                  key={c || "all"}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "shrink-0 whitespace-nowrap px-5 py-3.5 text-[14px] transition-colors",
                    active ? "-mb-px border-b-2 border-brand-green bg-brand-wash font-semibold text-brand-green" : "text-ink-soft hover:bg-surface hover:text-ink",
                  )}
                >
                  {c || "All"}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 px-4 pb-3 sm:flex-row sm:items-center xl:pb-0 xl:pl-0">
            <SearchInput value={query} onChange={setQuery} placeholder="Search by Articles…" className="sm:[&_input]:w-[190px]" />
            {canCreate && (
              <Button type="button" variant="brand" size="md" className="gap-2" onClick={() => setCreateOpen(true)}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Snippet
              </Button>
            )}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState title="No articles match" hint="Try another category or search term." />
        ) : (
          <div className="grid grid-cols-1 gap-6 p-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((a) => (
              <Link
                key={a.id}
                href={`/knowledge/${a.id}`}
                className="flex flex-col rounded-xl border border-line bg-white p-4 transition-all hover:border-brand-green/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <Pill tone="green" className="font-semibold">{a.category}</Pill>
                  <span className="text-[12px] text-muted">{a.languages.includes("am") ? "EN · አማ" : "EN"}</span>
                </div>
                <h3 className="mt-4 text-[18px] font-semibold leading-snug text-ink">{a.title}</h3>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-soft">{a.summary}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-[12.5px] text-muted">
                  <span className="min-w-0">{a.author} • <span className="whitespace-nowrap">{a.updatedAt}</span></span>
                  <span className="shrink-0 whitespace-nowrap font-semibold text-brand-green">{a.sends} sends</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

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
