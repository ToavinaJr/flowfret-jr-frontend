import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import MobileNav from "./MobileNav";

describe("MobileNav", () => {
  it("keeps the parent section selected on nested routes", () => {
    render(
      <MemoryRouter initialEntries={["/music/search"]}>
        <MobileNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Music" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
