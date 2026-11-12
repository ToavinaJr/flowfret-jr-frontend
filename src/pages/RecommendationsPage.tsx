import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { MusicRecommendationsSkeleton } from "@/components/features/music/MusicRecommendationsSkeleton";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";
import { fetchMyMusicRecommendations } from "@/services/musicGraphql";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

export default function RecommendationsPage() {
  const { t } = useTranslation();
  const recommendations = useQuery({
    queryKey: ["music-recommendations"],
    queryFn: fetchMyMusicRecommendations,
    staleTime: 5 * 60_000,
  });
  const tracks = recommendations.data ?? [];
  const playbackQueue = tracks.map(toMusicPlaybackItem);

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
        <section aria-label={t("music.recommendationsPageTitle")} className="space-y-3">
          {tracks.map((track, index) => (
            <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={playbackQueue} queueIndex={index} />
          ))}
        </section>
      ) : (
        <p role="status" className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t("music.recommendationsEmpty")}
        </p>
      )}
    </main>
  );
}
