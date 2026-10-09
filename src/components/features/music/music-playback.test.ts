import { describe, expect, it } from "vitest";
import { MUSIC_PROVIDER } from "@/constants/domain";
import type { MusicTrack } from "@/types/music";
import { toMusicPlaybackItem } from "./music-playback";

const baseTrack: MusicTrack = {
  provider: MUSIC_PROVIDER.SPOTIFY,
  id: "spotify-track",
  providerTrackId: "spotify-track",
  audiusId: "spotify-track",
  title: "Track",
  artists: [{ id: "artist", name: "Artist" }],
  imageUrl: null,
  audiusUrl: "https://open.spotify.com/track/spotify-track",
  externalUrl: "https://open.spotify.com/track/spotify-track",
  album: "Album",
  isrc: null,
  streamUrl: "https://open.spotify.com/track/spotify-track",
  genre: null,
  geniusUrl: null,
  geniusMatchScore: null,
  durationMs: 180_000,
};

describe("toMusicPlaybackItem", () => {
  it("uses a Spotify preview as native audio when one is available", () => {
    const previewUrl = "https://p.scdn.co/mp3-preview/preview.mp3";
    const item = toMusicPlaybackItem({ ...baseTrack, streamUrl: previewUrl });

    expect(item.engine).toBe("audio");
    expect(item.src).toBe(previewUrl);
  });

  it("keeps full Spotify tracks on the Spotify embed engine", () => {
    const item = toMusicPlaybackItem(baseTrack);

    expect(item.engine).toBe("spotify");
    expect(item.src).toBe("spotify:track:spotify-track");
  });
});
