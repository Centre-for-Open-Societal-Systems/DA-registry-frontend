import { authRequest } from "@/features/auth";
import type { Grievance, GrievanceCase, GrievancePriority, GrievanceStatus, ThreadMessage } from "./types";

// DA Services proxies the external OAN Grievance Service: a DA sees their own tickets, a Supervisor their
// Woreda's, an Admin all. Reads fail with 503 when the service is down; a submit is then queued instead.

/** GET /grievances/options: what the raise form offers. */
export interface GrievanceOptions {
  categories: { value: string; subcategories: string[] }[];
  priorities: string[];
  statuses: string[];
}

/** One row of GET /grievances. */
export interface ApiGrievance {
  ticket_id: string;
  subject: string;
  /** Open, In Progress, Escalated, Resolved or Closed. */
  status: string;
  priority: string;
  category: string;
  complainant_name: string;
  /** ISO timestamp with "Z". */
  created_at: string | null;
  updated_at: string | null;
}

/** GET /grievances/{ticket_id}. */
export interface ApiGrievanceDetail extends ApiGrievance {
  description: string;
  subcategory: string;
  complainant_id: string;
  complainant_role: string;
  region: string | null;
  woreda: string | null;
  assigned_to: string | null;
  resolution: string | null;
  resolved_at: string | null;
}

/** One entry of GET /grievances/{ticket_id}/timeline. */
export interface ApiGrievanceEvent {
  timestamp: string;
  /** e.g. "created", "assigned", "resolved". */
  action: string;
  actor: string;
  detail: string;
}

export interface SubmitGrievanceRequest {
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: string;
  raised_for: "Self" | "Farmer";
  /** Required when raised_for is "Farmer". */
  farmer_id?: string;
  /** Same id on a retry is not queued twice while the service is down. */
  client_op_id: string;
}

/** POST /grievances (201). `ticket_id` is null and `sync_state` "pending" when the service was down and it was queued. */
export interface SubmitGrievanceResult {
  ticket_id: string | null;
  sync_state: "synced" | "pending";
  queue_ref?: string;
  message: string | null;
}

export async function fetchGrievanceOptions(): Promise<GrievanceOptions> {
  return (await authRequest<{ data: GrievanceOptions }>("/da-services/grievances/options")).data;
}

/** Page size the API allows at most. */
export const GRIEVANCE_PAGE_MAX = 100;

export async function listGrievances({ page = 1, pageSize = 20, status }: { page?: number; pageSize?: number; status?: string } = {}): Promise<{ items: ApiGrievance[]; total: number }> {
  const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (status) query.set("status", status);
  const res = await authRequest<{ data: ApiGrievance[]; meta: { total: number } }>(`/da-services/grievances?${query}`);
  return { items: res.data, total: res.meta.total };
}

export async function fetchGrievance(ticketId: string): Promise<ApiGrievanceDetail> {
  return (await authRequest<{ data: ApiGrievanceDetail }>(`/da-services/grievances/${encodeURIComponent(ticketId)}`)).data;
}

export async function fetchGrievanceTimeline(ticketId: string): Promise<ApiGrievanceEvent[]> {
  return (await authRequest<{ data: ApiGrievanceEvent[] }>(`/da-services/grievances/${encodeURIComponent(ticketId)}/timeline`)).data;
}

export async function submitGrievance(body: SubmitGrievanceRequest): Promise<SubmitGrievanceResult> {
  return (await authRequest<{ data: SubmitGrievanceResult }>("/da-services/grievances", { method: "POST", body })).data;
}

/** Id for one submit (client_op_id). randomUUID needs https or localhost; plain http falls back to time + random. */
export const newClientOpId = () => (typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);

// The service's five statuses onto the portal's status vocabulary (and so onto the stat-card buckets).
const STATUS_MAP: Record<string, GrievanceStatus> = {
  Open: "Submitted",
  "In Progress": "In Progress",
  Escalated: "Under Review",
  Resolved: "Resolved",
  Closed: "Closed",
};

const PRIORITIES: GrievancePriority[] = ["Low", "Medium", "High", "Critical"];

/** "Sep 20, 2026, 1:00 PM" in the viewer's time zone (the service sends UTC); "—" when missing. */
export function formatGrievanceTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

/**
 * An API ticket in the table's shape. The list carries no region, attachments or raised-for, so those stay empty;
 * every API ticket counts as raised by a DA (the service records the signed-in DA or officer as complainant).
 */
export function toGrievance(g: ApiGrievance): Grievance {
  return {
    ticketId: g.ticket_id,
    title: g.subject,
    submitter: g.complainant_name,
    region: "",
    woreda: "",
    type: "",
    category: g.category,
    status: STATUS_MAP[g.status] ?? "Submitted",
    priority: PRIORITIES.includes(g.priority as GrievancePriority) ? (g.priority as GrievancePriority) : "Medium",
    submittedAt: formatGrievanceTime(g.created_at),
    attachments: 0,
    responses: 0,
    raisedBy: "DA",
    fromApi: true,
  };
}

/** Case view for an API ticket: its description and timeline as the thread, the complainant as submitter. */
export function caseFromApi(grievance: Grievance, detail?: ApiGrievanceDetail, timeline: ApiGrievanceEvent[] = []): GrievanceCase {
  const submittedOn = detail?.created_at ? new Date(detail.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const thread: ThreadMessage[] = [];
  if (detail) {
    thread.push({ kind: "submission", id: "submission", author: detail.complainant_name, role: detail.complainant_role, at: formatGrievanceTime(detail.created_at), body: detail.description || detail.subject, attachments: [] });
  }
  // "created" is the submission above; every later event is shown as a line in the thread.
  timeline
    .filter((e) => e.action !== "created")
    .forEach((e, i) => thread.push({ kind: "event", id: `event-${i}`, action: e.action, actor: e.actor, at: formatGrievanceTime(e.timestamp), detail: e.detail }));
  if (detail?.resolution) {
    thread.push({ kind: "internal-note", id: "resolution", author: detail.assigned_to ?? "Grievance Service", role: "Resolution", at: formatGrievanceTime(detail.resolved_at), body: detail.resolution });
  }

  return {
    grievance: detail ? { ...grievance, region: detail.region ?? "", woreda: detail.woreda ?? "", type: detail.subcategory } : grievance,
    thread,
    submitter: {
      name: detail?.complainant_name ?? grievance.submitter,
      kind: detail?.complainant_role ?? "—",
      faydaId: detail?.complainant_id ?? "—",
      kebele: "—",
      channel: "DA Portal",
      submittedOn,
    },
    // The service exposes no SLA yet; the tracker shows the submission date and no consumption.
    sla: { consumedPct: 0, submittedOn, dueOn: "—" },
  };
}
