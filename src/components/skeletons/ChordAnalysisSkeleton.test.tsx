import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChordAnalysisSkeleton } from "./ChordAnalysisSkeleton";

describe("ChordAnalysisSkeleton", () => {
  it("announces loading and mirrors the five-position chord timeline", () => {
    render(<ChordAnalysisSkeleton />);

    const loadingState = screen.getByRole("status", {
      name: /Loading chord analysis|Chargement de l’analyse des accords/,
    });
    expect(loadingState).toHaveAttribute("aria-live", "polite");
    expect(loadingState.firstElementChild?.children).toHaveLength(5);
    expect(loadingState.children).toHaveLength(3);
    expect(
      loadingState.lastElementChild?.querySelectorAll(".animate-pulse"),
    ).toHaveLength(14);
  });
});
