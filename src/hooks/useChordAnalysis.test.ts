import { describe, expect, it } from "vitest";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { ApiClientError } from "@/types/api";
import { AudioAnalysisError } from "@/utils/chordDetection";
import {
  canAnalyzeSource,
  classifyChordAnalysisError,
} from "./useChordAnalysis";

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
      canAnalyzeSource(item({ chordCues: [{ start: 0, end: 1, chord: "C" }] })),
    ).toBe(true);
  });

  it("accepts valid YouTube ids through the ephemeral backend stream", () => {
    expect(
      canAnalyzeSource(item({ engine: "youtube", src: "x77VucXB4jo" })),
    ).toBe(true);
    expect(canAnalyzeSource(item({ engine: "youtube", src: "invalid" }))).toBe(
      false,
    );
  });

  it("does not treat Spotify embeds as direct audio", () => {
    expect(canAnalyzeSource(item({ engine: "spotify" }))).toBe(false);
  });
});

describe("chord analysis diagnostics", () => {
  it("distinguishes an expired session from an extractor failure", () => {
    expect(
      classifyChordAnalysisError(new ApiClientError("Unauthorized", 401)),
    ).toEqual({ code: "authentication", status: 401 });
    expect(
      classifyChordAnalysisError(
        new AudioAnalysisError("response", 502, "diagnostic-id"),
      ),
    ).toEqual({
      code: "youtubeExtraction",
      status: 502,
      diagnosticId: "diagnostic-id",
    });
  });

  it("keeps the diagnostic id when a successful response stream aborts", () => {
    expect(
      classifyChordAnalysisError(
        new AudioAnalysisError("stream", 200, "diagnostic-id"),
      ),
    ).toEqual({
      code: "audioStream",
      status: 200,
      diagnosticId: "diagnostic-id",
    });
  });
});
