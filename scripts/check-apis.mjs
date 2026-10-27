

import { readFileSync } from "node:fs";

const TIMEOUT_MS = 20_000;

function backend() {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL;
  try {
    const line = readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/).find((l) => l.startsWith("API_BASE_URL="));
    if (line) return line.slice("API_BASE_URL=".length).trim();
  } catch {
    // no .env.local
  }
  return "http://127.0.0.1:8200";
}

const base = `${backend().replace(/\/$/, "")}/api/v1`;

async function call(method, path, { token, body } = {}) {
  const started = Date.now();
  try {
    const res = await fetch(base + path, {
      method,
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, ms: Date.now() - started, json };
  } catch (err) {
    const cause = err?.cause?.code ?? err?.name ?? "error";
    return { status: 0, ms: Date.now() - started, json: null, error: cause === "ENOTFOUND" ? "host not found (DNS)" : cause };
  }
}

async function accessToken() {
  if (process.env.DA_TOKEN) return process.env.DA_TOKEN;
  const { DA_USER: usr, DA_PASS: pwd } = process.env;
  if (!usr || !pwd) {
    console.error("Set DA_USER and DA_PASS (or DA_TOKEN) in your shell first.");
    process.exit(2);
  }
  const res = await call("POST", "/auth/login", { body: { usr, pwd } });
  const token = res.json?.data?.access_token;
  console.log(`POST /auth/login  ->  ${res.status || res.error}  (${res.ms} ms)${token ? "" : `  ${res.json?.message ?? ""}`}`);
  if (!token) process.exit(1);
  return token;
}

// First id-like value of the first record in a list response, wherever the list sits in the payload.
function firstId(json, ...keys) {
  const data = json?.data;
  const lists = [data, ...(data && typeof data === "object" ? Object.values(data) : [])].filter(Array.isArray);
  const first = lists.find((l) => l.length > 0)?.[0];
  if (!first || typeof first !== "object") return undefined;
  for (const key of keys) if (first[key] != null) return String(first[key]);
  return undefined;
}

const shape = (json) => {
  const data = json?.data;
  if (Array.isArray(data)) return `list of ${data.length}`;
  if (data && typeof data === "object") return Object.keys(data).slice(0, 6).join(", ");
  return json?.status ?? "";
};

const D = "/da-services";
const token = await accessToken();
const results = [];

async function check(label, path, { needs, probe } = {}) {
  if (needs && needs.includes(undefined)) {
    results.push({ label, status: "skipped", ms: "", note: "no id found to test with" });
    return undefined;
  }
  const res = await call("GET", path, { token });
  const ok = res.status >= 200 && res.status < 300;
  if (probe && res.status === 404) {
    results.push({ label, status: "reachable", ms: res.ms, note: "404 on made-up id (no real record to test with)" });
    return undefined;
  }
  results.push({ label, status: res.status || "—", ms: res.ms, note: ok ? shape(res.json) : (res.error ?? res.json?.message ?? "") });
  return res.json;
}

const me = await check("GET D/me", `${D}/me`);

// Admin has no DA-ID of its own: borrow a real one (and its woreda) from the assignments list.
const assignments = await check("GET D/assignments", `${D}/assignments?limit=50`);
const firstAssignment = (assignments?.data ?? []).find((a) => a?.da_id);
const daId = me?.data?.da_id ?? firstAssignment?.da_id;
const woreda = firstAssignment?.woreda;
const daQ = daId ? `da_id=${encodeURIComponent(daId)}` : "";
const woredaQ = woreda ? `woreda=${encodeURIComponent(woreda)}` : "";

await check("GET D/dashboard/summary", `${D}/dashboard/summary?${daQ}`, { needs: [daId] });
await check("GET D/dashboard/today", `${D}/dashboard/today?${daQ}`, { needs: [daId] });
await check("GET D/reports/activity", `${D}/reports/activity?${daQ}`, { needs: [daId] });
await check("GET D/assignments/coverage", `${D}/assignments/coverage?${woredaQ}`, { needs: [woreda] });
await check("GET D/assignments/me", `${D}/assignments/me`);
await check("GET D/master/areas", `${D}/master/areas`);
await check("GET D/master/kebeles", `${D}/master/kebeles?${woredaQ}`, { needs: [woreda] });
await check("GET D/agents/{da_id}", `${D}/agents/${daId}`, { needs: [daId] });

// With no real record to test on, a made-up id still proves the route is alive: 404 counts as reachable.
const farmers = await check("GET D/farmers", `${D}/farmers?limit=5`);
const realFarmerId = firstId(farmers, "name", "id", "farmer_id", "farmer");
const farmerId = realFarmerId ?? "FRM-PROBE";
for (const sub of ["profile", "visits", "plots", "permissions", "update-status"]) {
  await check(`GET D/farmers/{id}/${sub}`, `${D}/farmers/${farmerId}/${sub}`, { probe: !realFarmerId });
}

const visits = await check("GET D/visits", `${D}/visits?limit=5`);
const realVisitId = firstId(visits, "name", "id", "visit_id");
await check("GET D/visits/{id}", `${D}/visits/${realVisitId ?? "DA-VIS-PROBE"}`, { probe: !realVisitId });

await check("GET D/notifications", `${D}/notifications`);
await check("GET D/grievances/options", `${D}/grievances/options`);
const grievances = await check("GET D/grievances", `${D}/grievances?limit=5`);
const ticketId = firstId(grievances, "ticket_id", "ticketId", "name", "id");
await check("GET D/grievances/{ticketId}", `${D}/grievances/${ticketId}`, { needs: [ticketId] });
await check("GET D/grievances/{ticketId}/timeline", `${D}/grievances/${ticketId}/timeline`, { needs: [ticketId] });

// v2
const rbac = await check("GET D/rbac-assignments", `${D}/rbac-assignments?limit=5`);
const assignmentId = firstId(rbac, "name", "id", "assignment_id");
await check("GET D/rbac-assignments/{id}", `${D}/rbac-assignments/${assignmentId}`, { needs: [assignmentId] });
await check("GET D/profile/me", `${D}/profile/me`);
const changes = await check("GET D/profile/change-requests", `${D}/profile/change-requests?limit=5`);
const realRequestId = firstId(changes, "name", "id", "request_id");
await check("GET D/profile/change-requests/{id}", `${D}/profile/change-requests/${realRequestId ?? "CR-PROBE"}`, { probe: !realRequestId });
await check("GET D/farmer-links", `${D}/farmer-links`);

// A bogus refresh token must be rejected (4xx), not crash (5xx): proves the route is alive without touching the session.
{
  const res = await call("POST", "/auth/refresh", { body: { refresh_token: "probe" } });
  const alive = res.status >= 400 && res.status < 500;
  results.push({ label: "POST /auth/refresh (bogus token)", status: alive ? "reachable" : res.status || "—", ms: res.ms, note: alive ? `rejected with ${res.status}, as expected` : (res.error ?? res.json?.message ?? "") });
}

const pad = (value, width) => String(value).padEnd(width);
console.log(`\nBackend: ${base}\n`);
console.log(`${pad("Endpoint", 42)}${pad("Status", 9)}${pad("ms", 7)}Note`);
for (const r of results) console.log(`${pad(r.label, 42)}${pad(r.status, 9)}${pad(r.ms, 7)}${r.note}`);

const skipped = results.filter((r) => r.status === "skipped").length;
const reachable = results.filter((r) => r.status === "reachable").length;
const failed = results.filter((r) => r.status !== "skipped" && r.status !== "reachable" && !(typeof r.status === "number" && r.status >= 200 && r.status < 300));
console.log(`
${results.length - failed.length - skipped - reachable} ok, ${reachable} reachable (route alive, no data to test with), ${failed.length} failing, ${skipped} skipped.`);
process.exit(failed.length ? 1 : 0);
