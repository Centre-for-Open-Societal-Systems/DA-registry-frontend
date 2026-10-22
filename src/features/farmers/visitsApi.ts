import { authRequest } from "@/features/auth";

/** Body of POST /api/v1/da-services/visits. A DA plans for themself; an officer must also send `da_id`. */
export interface PlanVisitRequest {
  farmer_id: string;
  /** "2026-10-16" */
  date: string;
  /** "10:30" */
  time: string;
  /** Crop Survey, Livestock Survey, Services, Advisory or Follow-up. */
  visit_type: string;
  purpose: string;
  duration_min: number;
  priority: "Low" | "Medium" | "High";
  priority_reason?: string;
  location?: { lat: number; lng: number };
  notify_farmer_sms: boolean;
  /** Advisory visits only: the farmer's questions and the advice to give. */
  advisory_qa?: { question: string; answer: string }[];
  da_id?: string;
  /** Same id on a retry returns the visit already created instead of a duplicate. */
  client_op_id: string;
}

/** The planned visit as the backend stores it (subset the portal uses). */
export interface PlannedVisit {
  /** Visit id, e.g. "DA-VIS-0001". */
  name: string;
  da_id: string;
  farmer_id: string;
  visit_type: string;
  physical_status: string;
  scheduled_at: string;
  duration_min: number;
  priority: string;
}

/** POST /api/v1/da-services/visits (201). */
export async function planVisit(body: PlanVisitRequest): Promise<PlannedVisit> {
  const res = await authRequest<{ data: PlannedVisit }>("/da-services/visits", { method: "POST", body });
  return res.data;
}
