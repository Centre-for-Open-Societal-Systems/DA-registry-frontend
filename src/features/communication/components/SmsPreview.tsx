// Live SMS preview — a feature-phone frame so officers see what a farmer receives (FR-10).
export function SmsPreview({ text, sender }: { text: string; sender: string }) {
  const segments = Math.max(1, Math.ceil(text.length / 160));
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[260px] rounded-[22px] border-[6px] border-ink bg-slate-900 p-3 shadow-lg">
        <div className="rounded-[14px] bg-surface px-3 py-3">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted">{sender}</p>
          <div className="mt-2 rounded-2xl rounded-tl-sm bg-slate-200 px-3 py-2 text-[12.5px] leading-snug text-ink whitespace-pre-wrap break-words">
            {text || <span className="text-subtle">Message preview</span>}
          </div>
          <p className="mt-2 text-right text-[10px] text-subtle">now · {segments} segment{segments > 1 ? "s" : ""}</p>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted">Live SMS preview</p>
    </div>
  );
}
