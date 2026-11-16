import { describe, expect, it } from "vitest";
import { MUSIC_PROVIDER } from "@/constants/domain";
import type { MusicTrack } from "@/types/music";
import { filterRecommendationsByGenre, getRecommendationGenres } from "./recommendation-genres";

const tracks: MusicTrack[] = [
  createTrack("track-1", "Pop"),
  createTrack("track-2", " rock "),
  createTrack("track-3", "pop"),
  createTrack("track-4", null),
  createTrack("track-5", "  "),
  createTrack("track-6", "Afrobeat"),
];

describe("recommendation genre filters", () => {
  it("lists only non-empty genres, deduplicates without regard to case, and sorts them", () => {
    expect(getRecommendationGenres(tracks)).toEqual(["Afrobeat", "Pop", "rock"]);
  });

  it("returns all tracks when no genre is selected", () => {
    expect(filterRecommendationsByGenre(tracks, null)).toBe(tracks);
  });

  it("matches a selected genre without regard to surrounding whitespace or case", () => {
    expect(filterRecommendationsByGenre(tracks, "POP").map((track) => track.id)).toEqual([
      "track-1",
      "track-3",
    ]);
  });
});

function createTrack(id: string, genre: string | null): MusicTrack {
  return {
    provider: MUSIC_PROVIDER.AUDIUS,
    id,
    providerTrackId: id,
    audiusId: id,
    title: id,
    artists: [{ id: "artist-1", name: "Artist" }],
    imageUrl: null,
    audiusUrl: `https://audius.co/track/${id}`,
    externalUrl: `https://audius.co/track/${id}`,
    album: null,
    isrc: null,
    streamUrl: `https://api.audius.co/v1/tracks/${id}/stream`,
    genre,
    geniusUrl: null,
    geniusMatchScore: null,
    durationMs: 180_000,
  };
}
