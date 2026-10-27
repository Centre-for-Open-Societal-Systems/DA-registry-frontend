import { describe, expect, it } from "vitest";
import { navForRole } from "@/lib/rbac";
import { mockLogin } from "./login";

describe("mockLogin (Super Admin)", () => {
  it("signs the Super Admin in locally, with no token pair", () => {
    const result = mockLogin(" SuperAdmin@gmail.com ", "superadmin@123");
    expect(result?.role).toBe("SuperAdmin");
    expect(result?.profile.roleLabel).toBe("Super Admin");
    expect(result).not.toHaveProperty("tokens");
  });

  it("rejects a wrong password and unknown users", () => {
    expect(mockLogin("superadmin@gmail.com", "nope")).toBeNull();
    expect(mockLogin("nobody@gmail.com", "superadmin@123")).toBeNull();
  });

  it("leaves the other demo roles to the backend", () => {
    expect(mockLogin("admin@gmail.com", "admin@123")).toBeNull();
  });
});

describe("Super Admin navigation", () => {
  it("shows exactly Dashboard, Department, Users and Roles", () => {
    const hrefs = navForRole("SuperAdmin").flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toEqual(["/dashboard", "/department", "/users", "/roles"]);
  });

  it("keeps Department, Users and Roles away from every other role", () => {
    for (const role of ["DA", "Supervisor", "Executive", "Admin", "CommsOfficer"] as const) {
      const hrefs = navForRole(role).flatMap((g) => g.items.map((i) => i.href));
      for (const href of ["/department", "/users", "/roles"]) expect(hrefs).not.toContain(href);
    }
  });
});
