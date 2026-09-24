import { describe, expect, it } from "vitest";
import {
  TRANSCRIPTION_EVENT,
  TRANSCRIPTION_STATUS,
} from "@/constants/domain";
import type { TranscriptionResponse } from "@/types/transcription";
import { reduceTranscriptionEvent } from "./transcription-event-state";

const base: TranscriptionResponse = {
  transcriptionId: "transcription-1",
  provider: "AUDIUS",
  trackId: "track-1",
  title: "Song",
  artist: "Artist",
  createdAt: "2026-09-24T00:00:00.000Z",
  updatedAt: "2026-09-24T00:00:00.000Z",
  jobId: "job-1",
  status: TRANSCRIPTION_STATUS.PROCESSING,
  cached: false,
  readyToPlay: false,
  processingPhase: null,
  bufferedUntil: 0,
  progress: 0,
  segments: [],
  language: null,
  detectedLanguage: null,
  lrcAvailable: false,
  error: null,
};

describe("reduceTranscriptionEvent", () => {
  it("merges progress and segment events without mutating prior state", () => {
    const next = reduceTranscriptionEvent(base, {
      type: TRANSCRIPTION_EVENT.SEGMENT,
      transcriptionId: base.transcriptionId,
      progress: 50,
      bufferedUntil: 12,
      segment: { id: "1", start: 0, end: 2, text: "Hello", words: [] },
    });

    expect(next).toMatchObject({ progress: 50, bufferedUntil: 12 });
    expect(next.segments).toHaveLength(1);
    expect(base.segments).toHaveLength(0);
  });

  it("turns completion events into playable completed state", () => {
    expect(
      reduceTranscriptionEvent(base, {
        type: TRANSCRIPTION_EVENT.COMPLETED,
        transcriptionId: base.transcriptionId,
      }),
    ).toMatchObject({
      status: TRANSCRIPTION_STATUS.COMPLETED,
      readyToPlay: true,
      lrcAvailable: true,
    });
  });
});
