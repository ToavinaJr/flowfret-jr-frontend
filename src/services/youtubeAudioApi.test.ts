import { describe, expect, it } from "vitest";
import { getYouTubeAudioRequest } from "./youtubeAudioApi";

describe("YouTube audio API", () => {
  it("builds a same-backend request for a valid video id", () => {
    const request = getYouTubeAudioRequest("x77VucXB4jo");

    expect(request?.url).toContain("/api/youtube/x77VucXB4jo/audio");
  });

  it.each(["", "short", "x77VucXB4jo&list=other", "../video-id"])(
    "rejects invalid video id %p",
    (videoId) => {
      expect(getYouTubeAudioRequest(videoId)).toBeNull();
    },
  );
});
