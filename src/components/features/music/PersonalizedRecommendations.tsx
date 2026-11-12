import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MoreHorizontal, Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";
import { fetchMyMusicRecommendations } from "@/services/musicGraphql";
import type { MusicTrack } from "@/types/music";
import { MusicRecommendationsSkeleton } from "./MusicRecommendationsSkeleton";

export function PersonalizedRecommendations() {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ["music-recommendations"],
    queryFn: fetchMyMusicRecommendations,
    staleTime: 5 * 60_000,
  });
  const tracks = query.data ?? [];
  const visibleTracks = tracks.slice(0, 5);
  const playbackQueue = visibleTracks.map(toMusicPlaybackItem);

  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-4" aria-labelledby="music-recommendations-title">
      <header className="mb-3">
        <h2 id="music-recommendations-title" className="text-base font-semibold text-foreground">
          {t("music.recommendationsTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("music.recommendationsDescription")}</p>
      </header>
      {query.isLoading ? (
        <MusicRecommendationsSkeleton />
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
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {visibleTracks.map((track, index) => (
            <RecommendationRailCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={playbackQueue} queueIndex={index} />
          ))}
          <Link
            to="/recommendations"
            className="flex min-h-40 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/40 px-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreHorizontal className="h-6 w-6 text-primary" aria-hidden="true" />
            {t("feed.recommendationsMore")}
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("music.recommendationsEmpty")}</p>
      )}
    </section>
  );
}

function RecommendationRailCard({ track, playbackQueue, queueIndex }: { track: MusicTrack; playbackQueue: ReturnType<typeof toMusicPlaybackItem>[]; queueIndex: number }) {
  const { t } = useTranslation();
  const playback = usePlayback();
  const item = playbackQueue[queueIndex];
  const isPlaying = playback.item?.id === item.id && playback.playState === "playing";

  return (
    <article className="w-28 shrink-0">
      <button
        type="button"
        onClick={() => {
          if (playbackQueue.length > 1) playback.setQueue(playbackQueue, queueIndex);
          void playback.toggle(item);
        }}
        className="group relative mb-2 block aspect-square w-full overflow-hidden rounded-lg bg-secondary text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t(isPlaying ? "feed.pauseRecommendation" : "feed.playRecommendation", { title: track.title })}
      >
        {track.imageUrl ? <img src={track.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <span className="grid h-full w-full place-items-center text-2xl font-semibold text-muted-foreground">♫</span>}
        <span className="absolute bottom-1.5 right-1.5 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </span>
      </button>
      <p className="truncate text-sm font-medium text-foreground" title={track.title}>{track.title}</p>
      <p className="truncate text-xs text-muted-foreground" title={track.artists.map((artist) => artist.name).join(", ")}>{track.artists.map((artist) => artist.name).join(", ")}</p>
    </article>
  );
}
