import { describe, expect, it } from "vitest";
import { parseAudioStems, supportsVocalRemoval } from "./audioStemsApi";

const result = {
  audioStemId: "11111111-1111-4111-8111-111111111111", status: "COMPLETED", progress: 100,
  vocalsUrl: "https://cdn.example.com/vocals.mp3", instrumentalUrl: "https://cdn.example.com/backing.mp3",
};

describe("audio stem contract", () => {
  it("preserves the explicit simulated engine flag", () => {
    expect(parseAudioStems({ ...result, simulated: true }).simulated).toBe(true);
    expect(parseAudioStems(result).simulated).toBeUndefined();
  });
  it("accepts ready stems and intermediate downloading status", () => {
    expect(parseAudioStems(result)).toEqual(result);
    expect(parseAudioStems({ ...result, status: "DOWNLOADING", progress: 0, vocalsUrl: null, instrumentalUrl: null }).status).toBe("DOWNLOADING");
  });
  it("rejects incomplete, unsafe or malformed responses", () => {
    for (const override of [{ vocalsUrl: null }, { instrumentalUrl: "javascript:alert(1)" }, { progress: NaN }, { status: "UNKNOWN" }]) {
      expect(() => parseAudioStems({ ...result, ...override })).toThrow();
    }
  });
  it("excludes local files and Spotify before creating jobs", () => {
    const item = { id: "1", title: "Track", subtitle: "Artist", src: "blob:local" };
    expect(supportsVocalRemoval(item)).toBe(false);
    expect(supportsVocalRemoval({ ...item, provider: "SPOTIFY", providerTrackId: "1" })).toBe(false);
    expect(supportsVocalRemoval({ ...item, provider: "YOUTUBE", providerTrackId: "video" })).toBe(true);
  });
});
