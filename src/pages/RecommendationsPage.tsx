import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { MusicRecommendationsSkeleton } from "@/components/features/music/MusicRecommendationsSkeleton";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";
import { filterRecommendationsByGenre, getRecommendationGenres } from "@/components/features/music/recommendation-genres";
import { fetchMyMusicRecommendations } from "@/services/musicGraphql";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import type { MusicTrack } from "@/types/music";

const EMPTY_TRACKS: MusicTrack[] = [];

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const recommendations = useQuery({
    queryKey: ["music-recommendations"],
    queryFn: fetchMyMusicRecommendations,
    staleTime: 5 * 60_000,
  });
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const tracks = recommendations.data ?? EMPTY_TRACKS;
  const genres = useMemo(() => getRecommendationGenres(tracks), [tracks]);
  const visibleTracks = useMemo(
    () => filterRecommendationsByGenre(tracks, selectedGenre),
    [selectedGenre, tracks],
  );
  const playbackQueue = visibleTracks.map((track) => toMusicPlaybackItem(track));

  return (
    <main className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("music.recommendationsPageTitle")}</h1>
      <p className="-mt-3 mb-6 text-sm text-muted-foreground">
        {t("music.recommendationsPageDescription")}
      </p>
      {recommendations.isLoading ? (
        <MusicRecommendationsSkeleton layout="list" />
      ) : recommendations.isError ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p role="alert" className="text-sm text-muted-foreground">{t("music.recommendationsError")}</p>
          <button type="button" onClick={() => void recommendations.refetch()} className="mt-3 min-h-10 rounded-md border border-border px-4 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            {t("common.retry")}
          </button>
        </div>
      ) : tracks.length ? (
        <div className="space-y-5">
          {genres.length ? (
            <div role="group" aria-label={t("music.recommendationsFilterLabel")} className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-muted-foreground">{t("music.recommendationsFilterLabel")}</span>
              <button
                type="button"
                aria-pressed={selectedGenre === null}
                onClick={() => setSelectedGenre(null)}
                className={`min-h-9 rounded-md border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedGenre === null ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                {t("music.recommendationsAllGenres")}
              </button>
              {genres.map((genre) => (
                <button
                  key={genre.toLocaleLowerCase()}
                  type="button"
                  aria-pressed={selectedGenre?.toLocaleLowerCase() === genre.toLocaleLowerCase()}
                  onClick={() => setSelectedGenre(genre)}
                  className={`min-h-9 rounded-md border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedGenre?.toLocaleLowerCase() === genre.toLocaleLowerCase() ? "border-primary/40 bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  {genre}
                </button>
              ))}
            </div>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">{t("music.recommendationsGenresUnavailable")}</p>
          )}

          {visibleTracks.length ? (
            <section aria-label={t("music.recommendationsPageTitle")} className="space-y-3">
              {visibleTracks.map((track, index) => (
                <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={playbackQueue} queueIndex={index} />
              ))}
            </section>
          ) : (
            <div role="status" className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              <p>{t("music.recommendationsGenreEmpty", { genre: selectedGenre })}</p>
              <button
                type="button"
                onClick={() => setSelectedGenre(null)}
                className="mt-3 min-h-10 rounded-md border border-border px-4 text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t("music.recommendationsAllGenres")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <p role="status" className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("music.recommendationsEmpty")}
        </p>
      )}
    </main>
  );
}
