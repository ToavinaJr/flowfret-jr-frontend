import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ToolsLayout from "./ToolsLayout";

describe("ToolsLayout", () => {
  it("shows the four tools and marks the current one", () => {
    render(
      <MemoryRouter initialEntries={["/tuner"]}>
        <Routes>
          <Route element={<ToolsLayout />}>
            <Route path="/tuner" element={<p>Tuner page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Tuner page")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Practice tools" });
    expect(nav.querySelectorAll("a")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Tuner" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Chords" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
