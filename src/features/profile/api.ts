import { authRequest } from "@/features/auth";

/** Fields a DA may change, sent through a change request; the Supervisor approves before the registry changes. */
export interface ProfileChanges {
  mobile?: string;
  email?: string;
  language?: string;
  photo?: string;
  education_tier?: string;
  specialisation?: string;
}

export type ChangeRequestStatus = "Pending" | "Approved" | "Rejected" | "Changes requested" | "Cancelled";
export type ChangeRequestDecision = "Approve" | "Reject" | "Request changes";

export interface ChangeRequest {
  request_id: string;
  da_id?: string;
  section?: string;
  status: ChangeRequestStatus;
  reason?: string;
  changes?: Record<string, unknown>;
  old_values?: Record<string, unknown>;
  decision_note?: string | null;
  decided_by?: string | null;
  decided_at?: string | null;
  [field: string]: unknown;
}

/** GET /profile/me: the DA registry profile plus which fields the edit form may touch. */
export interface MyProfile {
  editable_fields: string[];
  locked_fields: string[];
  open_change_requests?: ChangeRequest[];
  [field: string]: unknown;
}

export async function fetchMyProfile(): Promise<MyProfile> {
  return (await authRequest<{ data: MyProfile }>("/da-services/profile/me")).data;
}

/** GET /agents/{da_id}: a DA registry card, scope-checked. */
export async function fetchAgent(daId: string): Promise<Record<string, unknown>> {
  return (await authRequest<{ data: Record<string, unknown> }>(`/da-services/agents/${encodeURIComponent(daId)}`)).data;
}

const requestPath = (id: string, part = "") => `/da-services/profile/change-requests/${encodeURIComponent(id)}${part}`;

/** POST /profile/change-requests: locked fields are rejected with 400. Resend the same clientOpId on a retry. */
export async function submitChangeRequest(changes: ProfileChanges, reason: string, clientOpId: string): Promise<ChangeRequest> {
  return (await authRequest<{ data: ChangeRequest }>("/da-services/profile/change-requests", { method: "POST", body: { changes, reason, client_op_id: clientOpId } })).data;
}

export async function listChangeRequests({ status, daId, limit = 50, start = 0 }: { status?: ChangeRequestStatus; daId?: string; limit?: number; start?: number } = {}): Promise<{ items: ChangeRequest[]; total: number }> {
  const query = new URLSearchParams({ limit: String(limit), start: String(start) });
  if (status) query.set("status", status);
  if (daId) query.set("da_id", daId);
  const res = await authRequest<{ data: ChangeRequest[]; meta?: { total?: number } }>(`/da-services/profile/change-requests?${query}`);
  return { items: res.data, total: res.meta?.total ?? res.data.length };
}

export async function fetchChangeRequest(id: string): Promise<ChangeRequest> {
  return (await authRequest<{ data: ChangeRequest }>(requestPath(id))).data;
}

/** POST …/cancel: the DA withdraws a request that is still Pending. */
export async function cancelChangeRequest(id: string): Promise<ChangeRequest> {
  return (await authRequest<{ data: ChangeRequest }>(requestPath(id, "/cancel"), { method: "POST" })).data;
}

/** POST …/decide: Supervisor or Admin. Approve sends the change on to the DA Registry. */
export async function decideChangeRequest(id: string, decision: ChangeRequestDecision, note: string): Promise<ChangeRequest> {
  return (await authRequest<{ data: ChangeRequest }>(requestPath(id, "/decide"), { method: "POST", body: { decision, note } })).data;
}
