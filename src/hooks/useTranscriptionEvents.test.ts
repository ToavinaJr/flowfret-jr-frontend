import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MusicTrack } from "@/types/music";
import type { TranscriptionResponse } from "@/types/transcription";
import {
  createTranscription,
  retryTranscription,
} from "@/services/transcriptionsApi";
import { useTranscriptionEvents } from "./useTranscriptionEvents";

vi.mock("@/services/transcriptionsApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/services/transcriptionsApi")>();
  return {
    ...actual,
    createTranscription: vi.fn(),
    retryTranscription: vi.fn(),
    streamTranscriptionEvents: vi.fn(),
  };
});

const youtubeTrack: MusicTrack = {
  provider: "YOUTUBE",
  id: "video-1",
  providerTrackId: "video-1",
  audiusId: "video-1",
  title: "Video",
  artists: [{ id: "channel-1", name: "Artist" }],
  imageUrl: null,
  audiusUrl: "https://www.youtube.com/watch?v=video-1",
  externalUrl: "https://www.youtube.com/watch?v=video-1",
  album: null,
  isrc: null,
  streamUrl: "https://www.youtube.com/watch?v=video-1",
  genre: null,
  geniusUrl: null,
  geniusMatchScore: null,
  durationMs: 60_000,
};

function response(
  provider: TranscriptionResponse["provider"],
): TranscriptionResponse {
  return {
    transcriptionId: `transcription-${provider}`,
    provider,
    trackId: youtubeTrack.providerTrackId,
    title: youtubeTrack.title,
    artist: youtubeTrack.artists[0].name,
    createdAt: "2026-10-07T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    jobId: null,
    status: "FAILED",
    cached: true,
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
}

describe("useTranscriptionEvents provider-aware retries", () => {
  beforeEach(() => {
    vi.mocked(createTranscription).mockReset();
    vi.mocked(retryTranscription).mockReset();
  });

  it("creates a transcription for the selected provider instead of retrying a stale provider", async () => {
    vi.mocked(createTranscription)
      .mockResolvedValueOnce(response("AUDIUS"))
      .mockResolvedValueOnce(response("YOUTUBE"));
    const { result } = renderHook(() =>
      useTranscriptionEvents(youtubeTrack),
    );

    await act(async () => {
      await result.current.prepare();
    });
    expect(result.current.transcription?.provider).toBe("AUDIUS");

    await act(async () => {
      await result.current.retry();
    });

    expect(retryTranscription).not.toHaveBeenCalled();
    expect(createTranscription).toHaveBeenLastCalledWith(
      expect.objectContaining({
        provider: "YOUTUBE",
        trackId: "video-1",
      }),
    );
    expect(result.current.transcription?.provider).toBe("YOUTUBE");
  });

  it("clears transcription state when the track provider changes", async () => {
    vi.mocked(createTranscription).mockResolvedValue(response("AUDIUS"));
    const { result, rerender } = renderHook(
      ({ track }: { track: MusicTrack }) => useTranscriptionEvents(track),
      {
        initialProps: {
          track: { ...youtubeTrack, provider: "AUDIUS" as const },
        },
      },
    );

    await act(async () => {
      await result.current.prepare();
    });
    expect(result.current.transcription?.provider).toBe("AUDIUS");

    rerender({ track: youtubeTrack });

    expect(result.current.transcription).toBeNull();
  });
});
