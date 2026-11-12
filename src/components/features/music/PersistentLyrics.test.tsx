import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { Lyrics, LyricsStatus } from "@/types/lyrics";
import type { TranscriptionResponse } from "@/types/transcription";
import { PersistentLyrics } from "./PersistentLyrics";

const lyricsState = vi.hoisted(() => ({
  value: { lyrics: null as Lyrics | null, status: "not-found" as LyricsStatus },
}));
const findTranscriptionForTrack = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useLyrics", () => ({ useLyrics: () => lyricsState.value }));
vi.mock("@/services/transcriptionsApi", () => ({ findTranscriptionForTrack }));

const item: PlaybackItem = {
  id: "youtube:video-42",
  src: "video-42",
  engine: "youtube",
  title: "Rainay ô",
  subtitle: "Ando Rak",
  artist: "Ando Rak",
  provider: "YOUTUBE",
  providerTrackId: "video-42",
};

function transcription(overrides: Partial<TranscriptionResponse>): TranscriptionResponse {
  return {
    transcriptionId: "t-1",
    provider: "YOUTUBE",
    trackId: "video-42",
    title: "Rainay ô",
    artist: "Ando Rak",
    createdAt: "",
    updatedAt: "",
    jobId: null,
    status: "COMPLETED",
    cached: true,
    readyToPlay: true,
    processingPhase: null,
    bufferedUntil: 0,
    progress: 100,
    segments: [],
    language: null,
    detectedLanguage: null,
    lrcAvailable: true,
    error: null,
    ...overrides,
  };
}

function renderLyrics() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PersistentLyrics item={item} currentTime={0} onSeek={vi.fn()} />
    </QueryClientProvider>,
  );
}

describe("PersistentLyrics", () => {
  beforeEach(() => {
    lyricsState.value = { lyrics: null, status: "not-found" };
    findTranscriptionForTrack.mockReset();
  });

  it("shows the existing transcription instead of 'lyrics unavailable' when the lookup misses", async () => {
    findTranscriptionForTrack.mockResolvedValue(
      transcription({
        segments: [
          { id: "s1", start: 1, end: 3, text: " Rainay ô ", words: [] },
          { id: "s2", start: 3, end: 5, text: "tiako ianao", words: [] },
        ],
      }),
    );
    renderLyrics();

    expect(await screen.findByRole("button", { name: "Rainay ô" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "tiako ianao" })).toBeInTheDocument();
    expect(screen.queryByText(/lyrics unavailable/i)).not.toBeInTheDocument();
    expect(findTranscriptionForTrack).toHaveBeenCalledWith("YOUTUBE", "video-42");
  });

  it("shows loading while the transcription is still in progress", async () => {
    findTranscriptionForTrack.mockResolvedValue(
      transcription({ status: "PROCESSING", segments: [], lrcAvailable: false }),
    );
    renderLyrics();

    expect(await screen.findByRole("status", { name: /loading lyrics/i })).toBeInTheDocument();
  });

  it("keeps 'lyrics unavailable' when there is no transcription either", async () => {
    findTranscriptionForTrack.mockResolvedValue(null);
    renderLyrics();

    expect(await screen.findByText(/lyrics unavailable/i)).toBeInTheDocument();
  });

  it("prefers found lyrics and does not look up a transcription", () => {
    lyricsState.value = {
      status: "success",
      lyrics: { provider: "lrclib", synced: false, instrumental: false, plainLyrics: "From LRCLIB", lines: [] },
    };
    renderLyrics();

    expect(screen.getByText("From LRCLIB")).toBeInTheDocument();
    expect(findTranscriptionForTrack).not.toHaveBeenCalled();
  });
});
