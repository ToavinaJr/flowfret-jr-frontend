import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import MobileNav from "./MobileNav";

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <MobileNav />
    </MemoryRouter>,
  );
}

describe("MobileNav", () => {
  it("keeps the parent section selected on nested routes", () => {
    renderAt("/music/search");

    expect(screen.getByRole("link", { name: "Music" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("exposes messages next to the primary destinations", () => {
    renderAt("/messages/abc");

    expect(screen.getByRole("link", { name: "Messages" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it.each(["/chords", "/scales", "/tuner", "/metronome"])(
    "highlights the Tools tab on %s",
    (path) => {
      renderAt(path);

      expect(screen.getByRole("link", { name: "Tools" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: "Feed" })).not.toHaveAttribute(
        "aria-current",
      );
    },
  );

  it("highlights only the home tab on the root route", () => {
    renderAt("/");

    expect(screen.getByRole("link", { name: "Feed" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "More" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
