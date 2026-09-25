import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { USER_ROLE, type UserRole } from "@/constants/domain";
import AdminRoute from "./AdminRoute";

const auth = vi.hoisted(() => ({ role: "ADMIN" as UserRole | null }));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: auth.role
      ? { id: "user-id", username: "user", email: "user@example.com", role: auth.role }
      : null,
  }),
}));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route path="/" element={<div>Application</div>} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>Administration</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
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

  it("redirects regular users to the application", () => {
    auth.role = USER_ROLE.USER;
    renderRoute();
    expect(screen.getByText("Application")).toBeInTheDocument();
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });
});
