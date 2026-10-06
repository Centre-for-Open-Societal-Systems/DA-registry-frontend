"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { SmsPreview } from "./SmsPreview";
import type { Article, Audience, Channel } from "../data";

const AUDIENCES: Audience[] = ["My linked farmers", "Farmers — Bako 01", "Farmers — Koye Feche", "Cooperative members — Bako", "Drought-response kebeles"];
const AUDIENCE_SIZE: Record<string, number> = { "My linked farmers": 248, "Farmers — Bako 01": 248, "Farmers — Koye Feche": 211, "Cooperative members — Bako": 96, "Drought-response kebeles": 387 };

// FR-11 "Send to farmers": snippet composer → channels (SMS/Telegram) → dispatch via the Broadcast engine, logged.
export function SendToFarmersModal({ article, isOpen, onClose }: { article: Article; isOpen: boolean; onClose: () => void }) {
  const [text, setText] = useState(article.snippet);
  const [audience, setAudience] = useState<Audience>("My linked farmers");
  const [channels, setChannels] = useState<Set<Channel>>(new Set(["SMS"]));
  const [language, setLanguage] = useState<"en" | "am">("en");
  const [sent, setSent] = useState(false);

  const toggle = (c: Channel) =>
    setChannels((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const close = () => {
    setSent(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Send to Farmers" subtitle={article.title} size="xl"
      footer={sent ? <Button variant="brand" onClick={close}>Done</Button> : (
        <>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button variant="brand" disabled={channels.size === 0 || text.trim().length === 0} onClick={() => setSent(true)}>Send to {AUDIENCE_SIZE[audience]} recipients</Button>
        </>
      )}
    >
      {sent ? (
        <Banner tone="success" title="Dispatched through the Broadcast engine">
          Snippet sent to {AUDIENCE_SIZE[audience]} recipients ({audience}) via {[...channels].join(" + ")}. The dispatch is logged to broadcast history with per-channel delivery outcomes; farmers without connectivity receive it by SMS.
        </Banner>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_260px]">
          <div className="flex flex-col gap-4">
            <FormField label="Message" htmlFor="snippet" required hint={`${text.length} characters · ${Math.max(1, Math.ceil(text.length / 160))} SMS segment${text.length > 160 ? "s" : ""}`}>
              <Textarea id="snippet" rows={5} value={text} onChange={(e) => setText(e.target.value)} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Audience" htmlFor="audience" required hint="Driven off the DA ⇄ farmer linkage (FR-07).">
                <Select id="audience" value={audience} onChange={(e) => setAudience(e.target.value as Audience)}>{AUDIENCES.map((a) => <option key={a}>{a}</option>)}</Select>
              </FormField>
              <FormField label="Language" htmlFor="lang">
                <Select id="lang" value={language} onChange={(e) => setLanguage(e.target.value as "en" | "am")}><option value="en">English</option><option value="am">Amharic (አማርኛ)</option></Select>
              </FormField>
            </div>
            <fieldset>
              <legend className="text-[14px] font-medium text-ink">Channels</legend>
              <div className="mt-2 flex gap-5">
                {(["SMS", "Telegram"] as Channel[]).map((c) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-[13.5px] text-slate-700">
                    <Checkbox checked={channels.has(c)} onChange={() => toggle(c)} /> {c}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <SmsPreview text={text} sender="OpenAgriNet" />
        </div>
      )}
    </Modal>
  );
}
