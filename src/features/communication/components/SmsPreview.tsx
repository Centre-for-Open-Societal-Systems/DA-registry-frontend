// Live SMS preview — a feature-phone frame so officers see what a farmer receives (FR-10).
export function SmsPreview({ text, sender }: { text: string; sender: string }) {
  const segments = Math.max(1, Math.ceil(text.length / 160));
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[260px] rounded-[22px] border-[6px] border-[#1a2b3c] bg-[#0f172a] p-3 shadow-lg">
        <div className="rounded-[14px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-[#64748b]">{sender}</p>
          <div className="mt-2 rounded-2xl rounded-tl-sm bg-[#E2E8F0] px-3 py-2 text-[12.5px] leading-snug text-[#1a2b3c] whitespace-pre-wrap break-words">
            {text || <span className="text-[#94A3B8]">Message preview</span>}
          </div>
          <p className="mt-2 text-right text-[10px] text-[#94A3B8]">now · {segments} segment{segments > 1 ? "s" : ""}</p>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-[#64748b]">Live SMS preview</p>
    </div>
  );
}
