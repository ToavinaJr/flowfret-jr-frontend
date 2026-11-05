import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";

const playback = vi.hoisted(() => ({
  item: {
    id: "YOUTUBE:video-42",
    src: "video-42",
    title: "Rainay ô",
    subtitle: "Ando Rak",
    artist: "Ando Rak",
    provider: "YOUTUBE",
    providerTrackId: "video-42",
    destination: undefined as string | undefined,
  },
  lastEndedItemId: null as string | null,
  playbackEndSequence: 0,
  playState: "paused",
  playbackError: null,
  currentTime: 0,
  duration: 120,
  volume: 1,
  toggle: vi.fn(),
  pause: vi.fn(),
  seek: vi.fn(),
  setVolume: vi.fn(),
  queue: [] as unknown[],
  shuffle: false,
  setShuffle: vi.fn(),
  next: vi.fn(),
  previous: vi.fn(),
  retry: vi.fn(),
  practiceLoop: { start: null, end: null, enabled: false },
  setPracticeLoopStart: vi.fn(),
  setPracticeLoopEnd: vi.fn(() => false),
  setPracticeLoopEnabled: vi.fn(),
  clearPracticeLoop: vi.fn(),
}));

vi.mock("@/contexts/usePlayback", () => ({ usePlayback: () => playback }));
vi.mock("@/components/features/music/PersistentLyrics", () => ({
  PersistentLyrics: () => <p>Lyrics window content</p>,
}));
vi.mock("@/components/features/music/PersistentChords", () => ({
  PersistentChords: () => <p>Chords window content</p>,
}));

import PersistentMediaPlayer from "./PersistentMediaPlayer";

describe("PersistentMediaPlayer lyrics control", () => {
  beforeEach(() => {
    playback.item = {
      id: "YOUTUBE:video-42",
      src: "video-42",
      title: "Rainay ô",
      subtitle: "Ando Rak",
      artist: "Ando Rak",
      provider: "YOUTUBE",
      providerTrackId: "video-42",
      destination: undefined,
    };
    playback.queue = [];
    playback.currentTime = 0;
    playback.pause.mockClear();
    playback.lastEndedItemId = null;
    playback.playbackEndSequence = 0;
    localStorage.clear();
  });

  it("shows the microphone beside guitar for YouTube and opens the lyrics window", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PersistentMediaPlayer />
        </MemoryRouter>
      </I18nextProvider>,
    );

    const lyricsButton = document.querySelector<HTMLButtonElement>(
      'button[aria-controls="floating-media-window-lyrics"]',
    );
    const chordsButton = document.querySelector<HTMLButtonElement>(
      'button[aria-controls="floating-media-window-chords"]',
    );
    expect(lyricsButton).not.toBeNull();
    expect(lyricsButton?.previousElementSibling).toBe(chordsButton);

    fireEvent.click(lyricsButton!);

    expect(screen.getByRole("dialog", { name: /lyrics/i })).toBeInTheDocument();
    expect(screen.getByText("Lyrics window content")).toBeInTheDocument();
  });

  it("closes the lyrics window when the current song ends", () => {
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PersistentMediaPlayer />
        </MemoryRouter>
      </I18nextProvider>,
    );
    fireEvent.click(
      document.querySelector<HTMLButtonElement>(
        'button[aria-controls="floating-media-window-lyrics"]',
      )!,
    );
    expect(screen.getByRole("dialog", { name: /lyrics/i })).toBeInTheDocument();

    playback.lastEndedItemId = playback.item.id;
    playback.playbackEndSequence += 1;
    rerender(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PersistentMediaPlayer />
        </MemoryRouter>
      </I18nextProvider>,
    );

    expect(screen.queryByRole("dialog", { name: /lyrics/i })).not.toBeInTheDocument();
  });

  it("opens the floating YouTube video at the current playback position", () => {
    playback.currentTime = 37.8;
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PersistentMediaPlayer />
        </MemoryRouter>
      </I18nextProvider>,
    );

    const videoButtons = screen.getAllByRole("button", { name: /watch this youtube video/i });
    fireEvent.click(videoButtons[0]);

    const dialog = screen.getByRole("dialog", { name: /youtube video/i });
    const iframe = dialog.querySelector("iframe");
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("youtube-nocookie.com/embed/video-42?autoplay=1"),
    );
    expect(iframe).toHaveAttribute("src", expect.stringContaining("start=37"));
    expect(playback.pause).toHaveBeenCalledOnce();
  });

  it("does not show the video action for a non-YouTube provider", () => {
    playback.item = { ...playback.item, provider: "AUDIUS", providerTrackId: "track-42" };
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PersistentMediaPlayer />
        </MemoryRouter>
      </I18nextProvider>,
    );

    expect(screen.queryByRole("button", { name: /watch this youtube video/i })).not.toBeInTheDocument();
  });
});
