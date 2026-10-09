import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  it("presents public entry points without rendering the auth form", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("link", { name: /get started|commencer/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /sign in|se connecter/i }).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });
});
