import { authRequest } from "@/features/auth";
import type { Role } from "@/lib/rbac";

/** Roles an Admin can give a new account. Admin itself is not handed out from the portal. */
export const ASSIGNABLE_ROLES = ["DA", "Supervisor", "Executive", "CommsOfficer"] as const satisfies readonly Role[];
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/** Backend role names, as /auth/register and /rbac-assignments expect them. */
export const BACKEND_ROLE: Record<AssignableRole, string> = {
  DA: "Development Agent",
  Supervisor: "Supervisor",
  Executive: "Executive",
  CommsOfficer: "Communications Officer",
};

export const isAssignableRole = (role: Role): role is AssignableRole => (ASSIGNABLE_ROLES as readonly Role[]).includes(role);

export interface NewUser {
  fullName: string;
  email: string;
  password: string;
  role: AssignableRole;
  /** Required by the backend for a Development Agent; ignored for other roles. */
  daId?: string;
  regionScope: string;
  /** Omitted for region-wide roles. */
  woredaScope?: string;
  /** ISO dates, "2026-10-15". */
  effectiveFrom: string;
  effectiveTo?: string;
}

/** POST /api/v1/auth/register as the signed-in Admin. Resolves to the backend user id, e.g. "5d69…@id.openagrinet.internal". */
export async function registerUser(u: Pick<NewUser, "fullName" | "email" | "password" | "role">): Promise<string> {
  // The response also carries tokens for the new account; the Admin's own session must not pick them up.
  const res = await authRequest<{ data: { user: string } }>("/auth/register", {
    method: "POST",
    body: { email: u.email, full_name: u.fullName, password: u.password, role: BACKEND_ROLE[u.role] },
  });
  return res.data.user;
}

export interface RbacAssignmentRecord {
  /** Assignment id, e.g. "DA-RBAC-00111". */
  name: string;
  user: string;
  role: string;
  da_id: string | null;
  region_scope: string | null;
  woreda_scope: string | null;
  effective_from: string;
  effective_to: string | null;
  active: boolean;
  assigned_by: string;
}

/** POST /api/v1/da-services/rbac-assignments: binds the role and its scope to the user. */
export async function createRbacAssignment(userId: string, u: NewUser): Promise<RbacAssignmentRecord> {
  const res = await authRequest<{ data: RbacAssignmentRecord }>("/da-services/rbac-assignments", {
    method: "POST",
    body: {
      user: userId,
      role: BACKEND_ROLE[u.role],
      ...(u.role === "DA" && { da_id: u.daId }),
      region_scope: u.regionScope,
      ...(u.woredaScope && { woreda_scope: u.woredaScope }),
      effective_from: u.effectiveFrom,
      ...(u.effectiveTo && { effective_to: u.effectiveTo }),
    },
  });
  return res.data;
}
