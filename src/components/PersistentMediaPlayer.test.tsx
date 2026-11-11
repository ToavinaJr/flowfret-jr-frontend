import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
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

function player() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(["runtime-features"], {
    chordTranscription: true,
    equalizerTranscription: false,
  });
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter>
          <PersistentMediaPlayer />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

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
    render(player());

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
    const { rerender } = render(player());
    fireEvent.click(
      document.querySelector<HTMLButtonElement>(
        'button[aria-controls="floating-media-window-lyrics"]',
      )!,
    );
    expect(screen.getByRole("dialog", { name: /lyrics/i })).toBeInTheDocument();

    playback.lastEndedItemId = playback.item.id;
    playback.playbackEndSequence += 1;
    rerender(player());

    expect(screen.queryByRole("dialog", { name: /lyrics/i })).not.toBeInTheDocument();
  });

  it("opens the floating YouTube video at the current playback position", () => {
    playback.currentTime = 37.8;
    render(player());

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
    render(player());

    expect(screen.queryByRole("button", { name: /watch this youtube video/i })).not.toBeInTheDocument();
  });
  it("groups controls by function in a single responsive layout", () => {
    render(player());

    const studyTools = screen.getByRole("group", { name: /practice tools/i });
    const chords = within(studyTools).getByRole("button", { name: /chord/i });
    const lyrics = within(studyTools).getByRole("button", { name: /lyrics/i });
    expect(chords.nextElementSibling).toBe(lyrics);

    const transport = screen.getByRole("group", { name: /playback controls/i });
    ["Shuffle", "Previous track", "Next track"].forEach((name) =>
      expect(within(transport).getByRole("button", { name })).toBeInTheDocument(),
    );
    expect(screen.getAllByRole("slider", { name: /seek|position/i })).toHaveLength(1);
    expect(screen.getAllByRole("slider", { name: /volume/i })).toHaveLength(1);
  });

  it("always shows favorite and add-to-playlist beside the track, even without a stream URL", () => {
    render(player());

    const trackActions = screen.getByRole("group", { name: /this track/i });
    const favorite = within(trackActions).getByRole("button", { name: /favorite/i });
    expect(favorite).toBeInTheDocument();
    expect(within(trackActions).getByRole("button", { name: /playlist/i })).toBeInTheDocument();
    // The queue belongs with the playback tools, never under the track card.
    expect(within(trackActions).queryByRole("button", { name: /queue/i })).toBeNull();
    expect(screen.getByRole("button", { name: /queue/i })).toBeInTheDocument();
  });

  it("keeps the track actions visible but disabled for a local file", () => {
    playback.item = {
      ...playback.item,
      provider: undefined,
      providerTrackId: undefined,
    } as unknown as typeof playback.item;
    render(player());

    const trackActions = screen.getByRole("group", { name: /this track/i });
    within(trackActions)
      .getAllByRole("button")
      .forEach((button) => expect(button).toBeDisabled());
    expect(within(trackActions).getAllByRole("button")).toHaveLength(2);
  });

  it("gives every player control a tooltip", () => {
    render(player());

    const bar = screen.getByRole("region", { name: /audio player/i });
    const controls = [
      ...within(bar).getAllByRole("button"),
      ...within(bar).getAllByRole("combobox"),
      ...within(bar).getAllByRole("slider"),
    ];
    expect(controls.length).toBeGreaterThan(10);
    controls.forEach((control) => expect(control.getAttribute("title")?.trim()).toBeTruthy());
  });

  it("hides the volume control for Spotify, which manages its own volume", () => {
    playback.item = { ...playback.item, engine: "spotify" } as typeof playback.item;
    render(player());

    expect(screen.queryByRole("slider", { name: /volume/i })).not.toBeInTheDocument();
  });
});
