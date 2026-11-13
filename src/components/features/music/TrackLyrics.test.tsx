import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MusicTrack } from "@/types/music";
import { TrackLyrics } from "./TrackLyrics";

const playback = vi.hoisted(() => ({ item: { id: "spotify:provider-id" }, currentTime: 0, seek: vi.fn(), lastEndedItemId: null as string | null, playbackEndSequence: 0 }));
vi.mock("@/contexts/usePlayback", () => ({ usePlayback: () => playback }));
vi.mock("@/hooks/useLyrics", () => ({ useLyrics: () => ({ lyrics: null, status: "not-found" }) }));
const track: MusicTrack = {
  provider: "SPOTIFY", id: "internal-id", providerTrackId: "provider-id", audiusId: "",
  title: "Song", artists: [{ id: "artist", name: "Artist" }], imageUrl: null,
  audiusUrl: "", externalUrl: "", album: null, isrc: null, streamUrl: "",
  genre: null, geniusUrl: null, geniusMatchScore: null, durationMs: 10000,
};

beforeEach(() => { playback.lastEndedItemId = null; playback.playbackEndSequence = 0; });

describe("TrackLyrics", () => {
  it("closes on each matching natural end, including replay, but not another track's end", () => {
    const { rerender } = render(<TrackLyrics track={track} />);
    const toggle = screen.getByRole("button");
    fireEvent.click(toggle);
    playback.lastEndedItemId = "spotify:other";
    playback.playbackEndSequence++;
    rerender(<TrackLyrics track={track} />);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    playback.lastEndedItemId = "spotify:provider-id";
    playback.playbackEndSequence++;
    rerender(<TrackLyrics track={track} />);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    rerender(<TrackLyrics track={track} />);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    playback.playbackEndSequence++;
    rerender(<TrackLyrics track={track} />);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
