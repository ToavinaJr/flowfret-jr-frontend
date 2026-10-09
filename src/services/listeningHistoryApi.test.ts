import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearAuthSession, setAccessToken } from "@/services/authToken";
import * as graphqlClient from "@/services/graphqlClient";
import { recordTrackListen } from "./listeningHistoryApi";

const item = {
  id: "track-1",
  src: "https://cdn.example.test/track.mp3",
  title: "Track",
  subtitle: "Artist",
  provider: "AUDIUS" as const,
  providerTrackId: "provider-track-1",
  externalUrl: "https://audius.co/track-1",
  streamUrl: "https://cdn.example.test/track.mp3",
  artists: [{ id: "artist-1", name: "Artist" }],
};

describe("listening history API", () => {
  beforeEach(() => {
    clearAuthSession();
  });

  afterEach(() => vi.restoreAllMocks());

  it("does not record a listen for an anonymous visitor", async () => {
    const graphqlRequestMock = vi.spyOn(graphqlClient, "graphqlRequest");

    await recordTrackListen(item);

    expect(graphqlRequestMock).not.toHaveBeenCalled();
  });

  it("records a valid listen for an authenticated visitor", async () => {
    setAccessToken("access-token");
    const graphqlRequestMock = vi
      .spyOn(graphqlClient, "graphqlRequest")
      .mockResolvedValue({ recordTrackListen: true });

    await recordTrackListen({ ...item, duration: 12.345 });

    expect(graphqlRequestMock).toHaveBeenCalledOnce();
    expect(graphqlRequestMock.mock.calls[0]?.[0].variables).toMatchObject({
      track: {
        provider: "AUDIUS",
        providerTrackId: "provider-track-1",
        durationMs: 12345,
      },
    });
  });
});
