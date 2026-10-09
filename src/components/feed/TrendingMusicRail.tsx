import { useQuery } from "@tanstack/react-query";
import { Pause, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import { fetchTrendingMusic } from "@/services/musicGraphql";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";

export function TrendingMusicRail() {
  const { t } = useTranslation();
  const playback = usePlayback();
  const query = useQuery({
    queryKey: ["music-trending"],
    queryFn: fetchTrendingMusic,
    staleTime: 5 * 60_000,
  });
  const tracks = query.data ?? [];
  const queue = tracks.map(toMusicPlaybackItem);

  return (
    <section className="mb-4 rounded-xl border border-border bg-card p-4" aria-labelledby="feed-trending-title">
      <div className="mb-3">
        <h2 id="feed-trending-title" className="text-base font-semibold text-foreground">{t("feed.trendingTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("feed.trendingDescription")}</p>
      </div>
      {query.isLoading ? (
        <div className="flex gap-3 overflow-hidden" aria-label={t("feed.trendingLoading")}>
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-36 w-28 shrink-0 animate-pulse rounded-lg bg-secondary" />)}
        </div>
      ) : query.isError ? (
        <p role="status" className="text-sm text-muted-foreground">{t("feed.trendingError")}</p>
      ) : tracks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("feed.trendingEmpty")}</p>
      ) : (
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {tracks.map((track, index) => {
            const item = queue[index];
            const isPlaying = playback.item?.id === item.id && playback.playState === "playing";
            return (
              <article key={`${track.provider}:${track.providerTrackId}`} className="w-28 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (queue.length > 1) playback.setQueue(queue, index);
                    void playback.toggle(item);
                  }}
                  className="group relative mb-2 block aspect-square w-full overflow-hidden rounded-lg bg-secondary text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t(isPlaying ? "feed.pauseTrendingTrack" : "feed.playTrendingTrack", { title: track.title })}
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
          })}
        </div>
      )}
    </section>
  );
}
