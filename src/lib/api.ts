// Thin fetch wrapper for the backend. Requests go to this app's /api/v1, which next.config proxies to the
// backend, so the browser never makes a cross-origin call.

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status; 0 when the request never reached the server. */
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequest {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Sent as `Authorization: Bearer …`; signed-in calls get it from features/auth (authRequest). */
  accessToken?: string;
}

export async function apiRequest<T>(path: string, { method = "GET", body, accessToken }: ApiRequest = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(errorMessage(data) ?? `Request failed (${res.status}).`, res.status);
  return data as T;
}

export const apiPost = <T>(path: string, body: unknown) => apiRequest<T>(path, { method: "POST", body });

// Error bodies carry their text under `message` (Frappe), `error` or `detail`; take the first readable one.
function errorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const d = data as Record<string, unknown>;
  for (const value of [d.message, d.error, d.detail]) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}
