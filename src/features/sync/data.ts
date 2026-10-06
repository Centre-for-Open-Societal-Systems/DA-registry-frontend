import type { PillTone } from "@/components/ui/Pill";

// FR-08 device-sync queue (app ⇄ server) — distinct from registry-sync (OAN ⇄ MoA).

export type QueueStatus = "Awaiting sync" | "Syncing" | "Synced" | "Failed" | "Conflict" | "Resolved — kept mine" | "Resolved — kept server" | "Resolved — merged";

export interface FieldConflict {
  field: string;
  device: string;
  server: string;
}

export interface QueueItem {
  id: string;
  entity: "Farmer update" | "Visit outcome" | "Survey response" | "Grievance" | "Internal issue" | "Certificate upload" | "Plot boundary" | "Credit application";
  ref: string;
  capturedAt: string;
  size: string;
  status: QueueStatus;
  detail?: string;
  conflicts?: FieldConflict[];
  /** Server record version the device edit was based on vs the current server version (FR-04c). */
  version?: { base: number; server: number };
}

export const QUEUE_TONE: Record<QueueStatus, PillTone> = {
  "Awaiting sync": "amber",
  Syncing: "blue",
  Synced: "green",
  Failed: "red",
  Conflict: "purple",
  "Resolved — kept mine": "green",
  "Resolved — kept server": "green",
  "Resolved — merged": "green",
};

export const QUEUE: QueueItem[] = [
  { id: "q-3301", entity: "Farmer update", ref: "Abebe Kebede · abebe-kebede", capturedAt: "16 Sep 2026, 09:14", size: "2 KB", status: "Conflict", detail: "Record changed on the server after this edit was captured", version: { base: 12, server: 13 }, conflicts: [
    { field: "Phone", device: "+251 91 555 0192", server: "+251 91 555 0100" },
    { field: "Household size", device: "7", server: "6" },
    { field: "Land tenure", device: "Certificate held", server: "Certificate held" },
    { field: "Total farmland (ha)", device: "1.75", server: "1.50" },
  ] },
  { id: "q-3302", entity: "Visit outcome", ref: "Visit 16 Sep · Chaltu Dinkesa", capturedAt: "16 Sep 2026, 11:40", size: "1.1 MB (3 photos)", status: "Awaiting sync" },
  { id: "q-3303", entity: "Survey response", ref: "Meher satisfaction · chaltu-dinkesa", capturedAt: "16 Sep 2026, 12:05", size: "4 KB", status: "Awaiting sync" },
  { id: "q-3304", entity: "Plot boundary", ref: "Parcel BK01-114 · 6 vertices", capturedAt: "16 Sep 2026, 12:30", size: "3 KB", status: "Awaiting sync", detail: "Held as Part-1 evidence until the Land Registry API is available" },
  { id: "q-3305", entity: "Grievance", ref: "On behalf of Tigist Worku", capturedAt: "15 Sep 2026, 17:20", size: "620 KB (photo + voice note)", status: "Failed", detail: "Grievance Service timeout — auto-retry scheduled" },
  { id: "q-3306", entity: "Certificate upload", ref: "First-aid certificate (Red Cross)", capturedAt: "09 Sep 2026, 08:15", size: "480 KB", status: "Synced" },
  { id: "q-3307", entity: "Internal issue", ref: "ISS-2041 · Motorcycle repair", capturedAt: "14 Sep 2026, 09:20", size: "1 KB", status: "Synced" },
  { id: "q-3308", entity: "Credit application", ref: "Meseret Tolera · Seasonal input loan", capturedAt: "16 Sep 2026, 13:02", size: "2 KB", status: "Awaiting sync" },
  { id: "q-3309", entity: "Visit outcome", ref: "Visit 16 Sep · Gemechu Bekele", capturedAt: "16 Sep 2026, 13:48", size: "860 KB (2 photos)", status: "Syncing" },
  { id: "q-3310", entity: "Farmer update", ref: "Kedir Mohammed · kedir-mohammed", capturedAt: "13 Sep 2026, 15:36", size: "2 KB", status: "Resolved — kept server", detail: "Server version kept after reviewing the household size change" },
];
