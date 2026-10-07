import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SynchronizedLyrics } from "./SynchronizedLyrics";

describe("SynchronizedLyrics", () => {
  it("highlights the active line and seeks when a line is clicked", () => {
    const onSeek = vi.fn();
    render(<SynchronizedLyrics segments={[{ id: "one", start: 3.5, end: 5, text: "First line", words: [] }]} activeIndex={0} onSeek={onSeek} />);
    const line = screen.getByRole("button", { name: "First line" });
    expect(line.className).toContain("font-semibold");
    fireEvent.click(line);
    expect(onSeek).toHaveBeenCalledWith(3.5);
  });

  it("highlights the active word within the active line when currentTime is provided", () => {
    const segments = [
      {
        id: "one",
        start: 3.5,
        end: 5,
        text: "First line",
        words: [
          { start: 3.5, end: 4, text: "First" },
          { start: 4, end: 5, text: " line" },
        ],
      },
    ];
    render(<SynchronizedLyrics segments={segments} activeIndex={0} onSeek={vi.fn()} currentTime={4.2} />);
    const line = screen.getByRole("button", { name: "First line" });
    const activeWord = line.querySelector(".text-primary");
    expect(activeWord?.textContent).toBe("line");
  });
});
