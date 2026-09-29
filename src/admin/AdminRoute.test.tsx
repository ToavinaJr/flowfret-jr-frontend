import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLE, type UserRole } from "@/constants/domain";
import AdminRoute from "./AdminRoute";

const auth = vi.hoisted(() => ({ role: "ADMIN" as UserRole | null }));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: auth.role
      ? {
          id: "user-id",
          username: "user",
          email: "user@example.com",
          role: auth.role,
        }
      : null,
  }),
}));

function renderRoute(path = "/admin") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<div>Application</div>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<div>Administration</div>} />
            <Route path="audit" element={<div>Audit log</div>} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function AdminShell() {
  return (
    <div>
      Admin shell
      <Outlet />
    </div>
  );
}

describe("AdminRoute", () => {
  afterEach(cleanup);

  beforeEach(() => {
    auth.role = USER_ROLE.ADMIN;
  });

  it("allows administrators", () => {
    renderRoute();
    expect(screen.getByText("Administration")).toBeInTheDocument();
  });

  it("allows administrators to open a nested admin page directly", () => {
    renderRoute("/admin/audit");
    expect(screen.getByText("Audit log")).toBeInTheDocument();
  });

  it("redirects regular users to the application", () => {
    auth.role = USER_ROLE.USER;
    renderRoute();
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("redirects a signed-out visitor away from an admin route", () => {
    auth.role = null;
    renderRoute("/admin/audit");
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.queryByText("Audit log")).not.toBeInTheDocument();
  });
});
