import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChordCue } from "@/types/song";
import { ChordTimeline } from "./ChordTimeline";

const cues: ChordCue[] = ["C", "G", "Am", "F", "Dm", "Em"].map(
  (chord, index) => ({ chord, start: index * 5, end: (index + 1) * 5 }),
);

describe("ChordTimeline", () => {
  it("shows two previous chords, the current chord, and two next chords", () => {
    render(<ChordTimeline cues={cues} activeIndex={2} capo={0} onSeek={vi.fn()} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("button", { current: true })).toHaveAccessibleName(
      /Am.*0:10/,
    );
    expect(screen.getByRole("button", { name: /C.*0:00/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Dm.*0:20/ })).toBeVisible();
  });

  it("places the current chord first on mobile and seeks to the next occurrence", () => {
    const seek = vi.fn();
    render(<ChordTimeline cues={cues} activeIndex={0} capo={0} onSeek={seek} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("button", { current: true }).closest("li")).toHaveClass(
      "col-start-1",
      "sm:col-start-3",
    );
    fireEvent.click(screen.getByRole("button", { name: /G.*0:05/ }));
    expect(seek).toHaveBeenCalledWith(5);
  });

  it("applies the capo and disables seeking when the song is inactive", () => {
    render(<ChordTimeline cues={cues} activeIndex={0} capo={2} />);

    expect(screen.getByRole("button", { name: /Bb.*0:00/ })).toBeDisabled();
  });
});
