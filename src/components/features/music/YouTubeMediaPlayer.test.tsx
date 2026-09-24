import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MusicTrack } from "@/types/music";
import { YouTubeMediaPlayer } from "./YouTubeMediaPlayer";

const playback = vi.hoisted(() => ({ toggle: vi.fn(), setQueue: vi.fn() }));
vi.mock("@/contexts/PlaybackContext", () => ({
  usePlayback: () => ({
    item: null,
    playState: "paused",
    toggle: playback.toggle,
    setQueue: playback.setQueue,
  }),
}));

const track: MusicTrack = {
  provider: "YOUTUBE",
  id: "youtube:video-1",
  providerTrackId: "video-1",
  audiusId: "video-1",
  title: "Song",
  artists: [{ id: "channel-1", name: "Artist" }],
  imageUrl: "https://i.ytimg.com/vi/video-1/hqdefault.jpg",
  audiusUrl: "https://www.youtube.com/watch?v=video-1",
  externalUrl: "https://www.youtube.com/watch?v=video-1",
  album: null,
  isrc: null,
  streamUrl: "",
  genre: "Rock",
  geniusUrl: null,
  geniusMatchScore: null,
  durationMs: 120_000,
};

describe("YouTubeMediaPlayer", () => {
  it("uses the shared audio-style player without rendering a video", () => {
    playback.toggle.mockResolvedValue(undefined);
    const queue = [
      {
        id: "youtube:video-1",
        src: "video-1",
        engine: "youtube" as const,
        title: "Song",
        subtitle: "Artist",
      },
      {
        id: "youtube:video-2",
        src: "video-2",
        engine: "youtube" as const,
        title: "Next song",
        subtitle: "Artist",
      },
    ];
    render(
      <YouTubeMediaPlayer
        track={track}
        playbackQueue={queue}
        queueIndex={0}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Play Song" }));

    expect(playback.setQueue).toHaveBeenCalledWith(queue, 0);
    expect(playback.toggle).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "youtube:video-1",
        src: "video-1",
        engine: "youtube",
        title: "Song",
      }),
    );
  });
});
