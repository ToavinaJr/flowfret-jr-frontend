import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

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
  useLyrics: () => mocks.lyricsResult,
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

  it("starts audio without transcribing when lyrics are unavailable", async () => {
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
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Afficher la transcription" })).not.toBeInTheDocument();
  });

  it("keeps audio playing when the browser tab loses focus", async () => {
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
    vi.mocked(HTMLMediaElement.prototype.pause).mockClear();

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    fireEvent(document, new Event("visibilitychange"));
    fireEvent(window, new Event("blur"));

    expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
  });

  it("does not expose the lyrics control when the lookup has no match", async () => {
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
    expect(screen.queryByRole("button", { name: "Afficher la transcription" })).not.toBeInTheDocument();
    expect(mocks.prepare).not.toHaveBeenCalled();
  });

  it("shows matched lyrics without transcribing", async () => {
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
    fireEvent.click(await screen.findByRole("button", { name: "Afficher la transcription" }));
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Transcription de Song")).toBeInTheDocument();
  });

  it("starts playback from the lyrics synchronization button", async () => {
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

    const syncButton = await screen.findByRole("button", {
      name: "Lancer la synchronisation des paroles",
    });
    expect(syncButton).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(syncButton);

    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled(),
    );
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Transcription de Song")).toBeInTheDocument();
  });
});
