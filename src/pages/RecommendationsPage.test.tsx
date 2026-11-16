import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MUSIC_PROVIDER } from "@/constants/domain";
import i18n from "@/i18n";
import type { MusicTrack } from "@/types/music";
import RecommendationsPage from "./RecommendationsPage";

const mocks = vi.hoisted(() => ({ fetchRecommendations: vi.fn() }));

vi.mock("@/services/musicGraphql", () => ({
  fetchMyMusicRecommendations: mocks.fetchRecommendations,
}));

vi.mock("@/components/features/music/MusicTrackCard", () => ({
  MusicTrackCard: ({
    track,
    playbackQueue,
    queueIndex,
  }: {
    track: MusicTrack;
    playbackQueue: unknown[];
    queueIndex: number;
  }) => (
    <div
      data-testid="recommendation-track"
      data-track={track.title}
      data-queue-size={playbackQueue.length}
      data-queue-index={queueIndex}
    >
      {track.title}
    </div>
  ),
}));

vi.mock("@/components/features/music/MusicRecommendationsSkeleton", () => ({
  MusicRecommendationsSkeleton: () => null,
}));

function renderRecommendationsPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n.cloneInstance({ lng: "en" })}>
        <RecommendationsPage />
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe("RecommendationsPage genre discovery", () => {
  beforeEach(() => {
    mocks.fetchRecommendations.mockReset();
  });

  it("filters recommendations and playback queue by the selected provider genre", async () => {
    mocks.fetchRecommendations.mockResolvedValue([
      createTrack("Midnight", "Rock"),
      createTrack("Morning", "Pop"),
    ]);
    renderRecommendationsPage();

    expect(await screen.findByRole("button", { name: "Rock" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Rock" }));

    expect(screen.getAllByTestId("recommendation-track")).toHaveLength(1);
    expect(screen.getByTestId("recommendation-track")).toHaveAttribute("data-track", "Midnight");
    expect(screen.getByTestId("recommendation-track")).toHaveAttribute("data-queue-size", "1");
    expect(screen.getByTestId("recommendation-track")).toHaveAttribute("data-queue-index", "0");
  });

  it("keeps all tracks visible and explains when genre metadata is unavailable", async () => {
    mocks.fetchRecommendations.mockResolvedValue([
      createTrack("Track One", null),
      createTrack("Track Two", null),
    ]);
    renderRecommendationsPage();

    expect(await screen.findByText("Genre filters are unavailable for these tracks.")).toBeInTheDocument();
    expect(screen.getAllByTestId("recommendation-track")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Rock" })).not.toBeInTheDocument();
  });

  it("preserves the existing empty recommendation state", async () => {
    mocks.fetchRecommendations.mockResolvedValue([]);
    renderRecommendationsPage();

    expect(await screen.findByText("Listen to a few tracks or add favorites to get personalized suggestions.")).toBeInTheDocument();
    expect(screen.queryByText("Genre filters are unavailable for these tracks.")).not.toBeInTheDocument();
  });
});

function createTrack(title: string, genre: string | null): MusicTrack {
  const id = title.toLowerCase().replace(/ /g, "-");
  return {
    provider: MUSIC_PROVIDER.AUDIUS,
    id,
    providerTrackId: id,
    audiusId: id,
    title,
    artists: [{ id: "artist-id", name: "Artist" }],
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
