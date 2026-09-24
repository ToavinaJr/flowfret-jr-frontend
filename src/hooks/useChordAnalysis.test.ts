import { describe, expect, it } from "vitest";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { canAnalyzeDirectly } from "./useChordAnalysis";

function item(overrides: Partial<PlaybackItem> = {}): PlaybackItem {
  return {
    id: "track",
    src: "source",
    title: "Track",
    subtitle: "Artist",
    ...overrides,
  };
}

describe("direct chord analysis sources", () => {
  it("accepts audio engines and imported files", () => {
    expect(canAnalyzeDirectly(item({ engine: "audio" }))).toBe(true);
    expect(canAnalyzeDirectly(item({ src: "blob:track" }))).toBe(true);
  });

  it("accepts tracks whose chords were already analyzed", () => {
    expect(
      canAnalyzeDirectly(
        item({ chordCues: [{ start: 0, end: 1, chord: "C" }] }),
      ),
    ).toBe(true);
  });

  it("does not treat embedded providers as direct audio", () => {
    expect(canAnalyzeDirectly(item({ engine: "youtube" }))).toBe(false);
    expect(canAnalyzeDirectly(item({ engine: "spotify" }))).toBe(false);
  });
});
