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
});
