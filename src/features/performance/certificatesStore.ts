import { create } from "zustand";
import { CERTIFICATES, type Certificate } from "./training";

interface CertificatesState {
  rows: Certificate[];
  /** Adds a DA-submitted external certificate at the top of the list. */
  add: (certificate: Certificate) => void;
}

// Shared by the Certificates tab and the certificate page. In memory only: uploads reset on reload until the API lands.
export const useCertificatesStore = create<CertificatesState>()((set) => ({
  rows: CERTIFICATES,
  add: (certificate) => set((s) => ({ rows: [certificate, ...s.rows] })),
}));
