import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";
import { fetchMyMusicRecommendations } from "@/services/musicGraphql";

export function PersonalizedRecommendations() {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["music-recommendations"],
    queryFn: fetchMyMusicRecommendations,
    staleTime: 5 * 60_000,
  });
  const tracks = query.data ?? [];
  const playbackQueue = tracks.map(toMusicPlaybackItem);

  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-4" aria-labelledby="music-recommendations-title">
      <header className="mb-3">
        <h2 id="music-recommendations-title" className="text-base font-semibold text-foreground">
          {t("music.recommendationsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("music.recommendationsDescription")}</p>
      </header>
      {query.isLoading ? (
        <p role="status" className="text-sm text-muted-foreground">{t("music.recommendationsLoading")}</p>
      ) : query.isError ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role="status" className="text-sm text-muted-foreground">{t("music.recommendationsError")}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="min-h-10 rounded-md border border-border px-3 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : tracks.length ? (
        <ul className="space-y-3">
          {tracks.map((track, index) => (
            <li key={`${track.provider}:${track.providerTrackId}`}>
              <MusicTrackCard track={track} playbackQueue={playbackQueue} queueIndex={index} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t("music.recommendationsEmpty")}</p>
      )}
    </section>
  );
}
