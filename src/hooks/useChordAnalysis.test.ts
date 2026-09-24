import { describe, expect, it } from "vitest";
import { chooseBestAudiusMatch } from "./useChordAnalysis";
import type { MusicTrack } from "@/types/music";

function track(
  id: string,
  title: string,
  artist: string,
  durationMs = 180_000,
): MusicTrack {
  return {
    provider: "AUDIUS",
    id,
    providerTrackId: id,
    audiusId: id,
    title,
    artists: [{ id: `artist-${id}`, name: artist }],
    imageUrl: null,
    audiusUrl: "https://audius.co",
    externalUrl: "https://audius.co",
    album: null,
    isrc: null,
    streamUrl: `https://api.audius.co/v1/tracks/${id}/stream`,
    genre: null,
    geniusUrl: null,
    geniusMatchScore: null,
    durationMs,
  };
}

describe("Audius chord source matching", () => {
  const item = {
    title: "Everlong (Official Video)",
    artist: "Foo Fighters",
    subtitle: "Foo Fighters",
    duration: 250,
  };

  it("prefers matching title, artist and duration", () => {
    const match = chooseBestAudiusMatch(item, [
      track("wrong", "Everlong remix", "Someone Else", 180_000),
      track("right", "Everlong", "Foo Fighters", 251_000),
    ]);

    expect(match?.id).toBe("right");
  });

  it("rejects unrelated results", () => {
    expect(
      chooseBestAudiusMatch(item, [
        track("wrong", "Another Song", "Another Artist"),
      ]),
    ).toBeNull();
  });
});
