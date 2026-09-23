import { describe, expect, it } from "vitest";
import { getYouTubeEmbedUrl } from "@/utils/youtubeEmbed";

describe("getYouTubeEmbedUrl", () => {
  it("builds a privacy-enhanced URL for a valid YouTube id", () => {
    expect(getYouTubeEmbedUrl("dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1",
    );
  });

  it.each(["", "short", "https://www.google.com/", "dQw4w9WgXcQ?redirect=1"])(
    "rejects an unsafe or malformed id: %s",
    (videoId) => {
      expect(getYouTubeEmbedUrl(videoId)).toBeNull();
    },
  );
});
