import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MenuPage from "./MenuPage";

const authState = vi.hoisted(() => ({
  user: { id: "1", username: "alice", role: "USER" } as {
    id: string;
    username: string;
    role: string;
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: authState.user }),
}));

function renderPage() {
  render(
    <MemoryRouter>
      <MenuPage />
    </MemoryRouter>,
  );
}

describe("MenuPage", () => {
  beforeEach(() => {
    authState.user = { id: "1", username: "alice", role: "USER" };
  });

  it("lists secondary destinations by section and omits bottom tabs", () => {
    renderPage();

    ["Playlists", "Guitar lessons", "Friends", "Settings", "Help", "History", "Contact"].forEach(
      (name) => expect(screen.getByRole("link", { name })).toBeInTheDocument(),
    );
    expect(screen.queryByRole("link", { name: "Chords" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Messages" })).toBeNull();
    expect(screen.getByRole("button", { name: /Log out \(alice\)/ })).toBeInTheDocument();
  });

  it("shows the administration link to admins only", () => {
    renderPage();
    expect(screen.queryByRole("link", { name: "Administration" })).toBeNull();

    authState.user = { id: "2", username: "root", role: "ADMIN" };
    renderPage();
    expect(screen.getAllByRole("link", { name: /admin/i }).length).toBeGreaterThan(0);
  });
});
