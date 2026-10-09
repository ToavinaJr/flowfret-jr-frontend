import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";

const mocks = vi.hoisted(() => {
  let transcription: unknown = null;
  const listeners = new Set<() => void>();
  return {
    prepare: vi.fn(),
    retry: vi.fn(),
    setTranscription: (value: unknown) => {
      transcription = value;
      listeners.forEach((listener) => listener());
    },
    getTranscription: () => transcription,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    // No LRCLIB match by default, so existing tests exercise the Whisper
    // fallback path deterministically instead of racing a real network call.
    lyricsResult: { lyrics: null, status: "not-found" } as {
      lyrics: { synced: boolean; lines: { startTimeMs: number | null; text: string }[] } | null;
      status: string;
    },
  };
});
vi.mock("@/hooks/useTranscriptionEvents", () => ({
  useTranscriptionEvents: () => {
    const [, forceRender] = useState(0);
    useEffect(() => {
      const unsubscribe = mocks.subscribe(() => forceRender((n) => n + 1));
      return unsubscribe;
    }, []);
    return {
      transcription: mocks.getTranscription(),
      error: null,
      prepare: mocks.prepare,
      retry: mocks.retry,
    };
  },
}));
vi.mock("@/hooks/useLyrics", () => ({
  // Mirrors the real hook's gating: nothing resolves before the caller
  // passes `enabled: true` (i.e. before lyrics are actually opened), so
  // tests can't accidentally observe an LRCLIB match before the UI does.
  useLyrics: (_track: unknown, enabled: boolean) =>
    enabled ? mocks.lyricsResult : { lyrics: null, status: "idle" },
}));

const track = {
  provider: "AUDIUS" as const,
  id: "track",
  providerTrackId: "track",
  audiusId: "track",
  title: "Song",
  artists: [{ id: "artist", name: "Artist" }],
  imageUrl: null,
  audiusUrl: "https://audius.co/artist/song",
  externalUrl: "https://audius.co/artist/song",
  album: null,
  isrc: null,
  streamUrl: "https://audio.audius.co/song.mp3",
  genre: "Rock",
  geniusUrl: null,
  geniusMatchScore: null,
  durationMs: 120000,
};

describe("AudiusMediaPlayer transcription", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("fr");
    mocks.prepare.mockReset();
    mocks.setTranscription(null);
    mocks.lyricsResult = { lyrics: null, status: "not-found" };
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("starts audio and transcribes the selected Audius source", async () => {
    mocks.prepare.mockReturnValue(new Promise(() => undefined));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <PlaybackProvider>
            <AudiusMediaPlayer track={track} />
          </PlaybackProvider>
        </I18nextProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Lire Song" }));
    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled(),
    );
    expect(mocks.prepare).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Transcription de Song")).toBeInTheDocument();
  });

  it("waits for the transcription to complete before playing when lyrics are opened first", async () => {
    mocks.prepare.mockImplementation(async () => {
      mocks.setTranscription({ status: "PENDING", segments: [] });
      return { transcriptionId: "t1", status: "PENDING", cached: false };
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <PlaybackProvider>
            <AudiusMediaPlayer track={track} />
          </PlaybackProvider>
        </I18nextProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Afficher la transcription" }),
    );
    await waitFor(() => expect(mocks.prepare).toHaveBeenCalledOnce());
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();

    mocks.setTranscription({ status: "COMPLETED", segments: [] });
    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled(),
    );
  });

  it("plays immediately from a synced LRCLIB match without transcribing", async () => {
    mocks.lyricsResult = {
      lyrics: { synced: true, lines: [{ startTimeMs: 0, text: "La la la" }] },
      status: "success",
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <PlaybackProvider>
            <AudiusMediaPlayer track={track} />
          </PlaybackProvider>
        </I18nextProvider>
      </QueryClientProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Afficher la transcription" }),
    );
    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled(),
    );
    expect(mocks.prepare).not.toHaveBeenCalled();
  });
});
