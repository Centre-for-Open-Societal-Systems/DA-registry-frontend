"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { Banner } from "@/components/ui/Banner";

// Portal accounts are provisioned by an administrator (no self-registration); this sends them an access request.
export function ContactAdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const close = () => {
    setSentTo(null);
    onClose();
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSentTo(String(form.get("email") ?? ""));
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Request Portal Access" subtitle="Accounts are created by your Woreda or regional administrator — there is no self-registration.">
      {sentTo ? (
        <div className="flex flex-col gap-4">
          <Banner tone="success" title="Access request sent">
            Your administrator has been notified. Once your account is created you&apos;ll receive sign-in details at <span className="font-semibold">{sentTo}</span>.
          </Banner>
          <div className="flex justify-end">
            <Button variant="brand" onClick={close}>Back to sign in</Button>
          </div>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <FormField label="Full name" htmlFor="req-name" required>
            <Input id="req-name" name="name" required placeholder="Your full name" />
          </FormField>
          <FormField label="Email address" htmlFor="req-email" required>
            <Input id="req-email" name="email" type="email" required placeholder="name@example.com" />
          </FormField>
          <FormField label="Woreda / office" htmlFor="req-office" required>
            <Input id="req-office" name="office" required placeholder="e.g. Bako Tibe Woreda Agriculture Office" />
          </FormField>
          <FormField label="Message" htmlFor="req-msg" hint="Your role (DA, supervisor…) and DA-ID if you have one.">
            <Textarea id="req-msg" name="message" rows={3} />
          </FormField>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={close}>Cancel</Button>
            <Button type="submit" variant="brand">Send request</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
