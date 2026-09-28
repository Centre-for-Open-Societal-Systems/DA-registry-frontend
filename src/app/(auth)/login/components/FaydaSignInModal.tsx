"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { DEMO_ACCOUNTS, type DemoAccount } from "@/features/auth/accounts";

// No Fayda integration yet: the one demo DA is linked to this FIN and any 6-digit OTP is accepted.
const DEMO_FIN = "351244987712";
const DEMO_OTP = "123456";

const digitsOnly = (v: string) => v.replace(/\D/g, "");

interface FaydaSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignedIn: (account: DemoAccount) => void;
}

export function FaydaSignInModal({ isOpen, onClose, onSignedIn }: FaydaSignInModalProps) {
  const [step, setStep] = useState<"fin" | "otp">("fin");
  const [fin, setFin] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setStep("fin");
    setFin("");
    setOtp("");
    setError(null);
    onClose();
  };

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (digitsOnly(fin).length !== 12) {
      setError("A Fayda ID (FIN) has 12 digits.");
      return;
    }
    if (digitsOnly(fin) !== DEMO_FIN) {
      setError("No agent account is linked to this Fayda ID. Contact your administrator to link it.");
      return;
    }
    setError(null);
    setStep("otp");
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (digitsOnly(otp).length !== 6) {
      setError("Enter the 6-digit code sent to your Fayda-registered phone.");
      return;
    }
    const account = DEMO_ACCOUNTS.find((a) => a.role === "DA");
    if (!account) return;
    setError(null);
    onSignedIn(account);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Sign in with FAYDA ID"
      subtitle={step === "fin" ? "Enter your 12-digit Fayda ID (FIN). We'll send a one-time code to the phone registered with Fayda." : `Code sent to the phone linked to FIN •••• •••• ${digitsOnly(fin).slice(-4)}.`}
    >
      <form className="flex flex-col gap-4" onSubmit={step === "fin" ? sendOtp : verify}>
        {error && <ErrorAlert message={error} />}
        {step === "fin" ? (
          <FormField label="Fayda ID (FIN)" htmlFor="fayda-fin" required hint={`Demo: ${DEMO_FIN.replace(/(\d{4})(?=\d)/g, "$1 ")}`}>
            <Input id="fayda-fin" inputMode="numeric" autoFocus value={fin} onChange={(e) => setFin(e.target.value)} placeholder="0000 0000 0000" />
          </FormField>
        ) : (
          <FormField label="One-time code" htmlFor="fayda-otp" required hint={`Demo code: ${DEMO_OTP} (any 6 digits work)`}>
            <Input id="fayda-otp" inputMode="numeric" autoFocus maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
          </FormField>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {step === "otp" && (
            <Button type="button" variant="outline" onClick={() => { setStep("fin"); setOtp(""); setError(null); }}>
              Change Fayda ID
            </Button>
          )}
          <Button type="submit" variant="brand">{step === "fin" ? "Send code" : "Verify & sign in"}</Button>
        </div>
      </form>
    </Modal>
  );
}
