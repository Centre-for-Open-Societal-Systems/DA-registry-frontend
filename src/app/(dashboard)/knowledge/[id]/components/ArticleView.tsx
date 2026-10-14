import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import type { Article } from "@/features/communication";
import { BackLink } from "@/components/ui/BackLink";
import { SendToFarmersButton } from "./SendToFarmersButton";

// Appendix C.5 Article detail: Send to farmers → snippet composer → Broadcast (FR-11).
export function ArticleView({ article }: { article: Article }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/knowledge" label="Back to Knowledge Base" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="shadow-card">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="green">{article.category}</Pill>
            <span className="text-[12.5px] text-muted">{article.author} · updated {article.updatedAt} · {article.languages.includes("am") ? "English · Amharic" : "English"}</span>
          </div>
          <h1 className="mt-3 text-[24px] font-semibold leading-tight tracking-tight text-ink">{article.title}</h1>
          <p className="mt-2 text-[15px] text-ink-soft">{article.summary}</p>
          <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-ink">
            {article.body.map((p) => <p key={p}>{p}</p>)}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="shadow-card">
            <h2 className="text-[15px] font-semibold text-ink">SMS-ready snippet</h2>
            <p className="mt-2 rounded-lg border border-line bg-surface p-3 text-[13px] leading-relaxed text-ink">{article.snippet}</p>
            <p className="mt-1.5 text-[12px] text-muted">{article.snippet.length} characters · {Math.ceil(article.snippet.length / 160)} segment{article.snippet.length > 160 ? "s" : ""}</p>
            <SendToFarmersButton article={article} />
            <p className="mt-2 text-center text-[12px] text-muted">Dispatched via the Broadcast engine and logged.</p>
          </Card>
          <Card className="shadow-card">
            <h2 className="text-[15px] font-semibold text-ink">Dissemination</h2>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-[13px]">
              <dt className="text-muted">Total sends</dt><dd className="text-right font-medium text-ink">{article.sends}</dd>
              <dt className="text-muted">Last sent</dt><dd className="text-right font-medium text-ink">{article.sends > 0 ? "12 Sep 2026" : "—"}</dd>
              <dt className="text-muted">Channels</dt><dd className="text-right font-medium text-ink">SMS · Telegram</dd>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
