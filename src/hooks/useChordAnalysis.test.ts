import { describe, expect, it } from "vitest";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { canAnalyzeSource } from "./useChordAnalysis";

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
    expect(canAnalyzeSource(item({ engine: "audio" }))).toBe(true);
    expect(canAnalyzeSource(item({ src: "blob:track" }))).toBe(true);
  });

  it("accepts tracks whose chords were already analyzed", () => {
    expect(
      canAnalyzeSource(
        item({ chordCues: [{ start: 0, end: 1, chord: "C" }] }),
      ),
    ).toBe(true);
  });

  it("accepts valid YouTube ids through the ephemeral backend stream", () => {
    expect(canAnalyzeSource(item({ engine: "youtube", src: "x77VucXB4jo" }))).toBe(true);
    expect(canAnalyzeSource(item({ engine: "youtube", src: "invalid" }))).toBe(false);
  });

  it("does not treat Spotify embeds as direct audio", () => {
    expect(canAnalyzeSource(item({ engine: "spotify" }))).toBe(false);
  });
});
