import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { FAVORITE_MUSIC_QUERY_KEY } from "@/components/features/music/FavoriteTrackButton";
import { fetchFavoriteMusic } from "@/services/favoriteMusicApi";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const [sortMode, setSortMode] = useState<"recent" | "title" | "artist">("recent");
  const favorites = useQuery({ queryKey: FAVORITE_MUSIC_QUERY_KEY, queryFn: fetchFavoriteMusic });
  const tracks = useMemo(() => favorites.data ?? [], [favorites.data]);
  const visibleTracks = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase();
    return tracks
      .filter((track) =>
        !query || [track.title, track.album ?? "", track.genre ?? "", ...track.artists.map((artist) => artist.name)]
          .some((value) => value.toLocaleLowerCase().includes(query)),
      )
      .sort((left, right) => {
        if (sortMode === "title") return left.title.localeCompare(right.title);
        if (sortMode === "artist") return (left.artists[0]?.name ?? "").localeCompare(right.artists[0]?.name ?? "");
        return 0;
      });
  }, [filter, sortMode, tracks]);
  const queue = visibleTracks.map(toMusicPlaybackItem);

  return (
    <main className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("favorites.title")}</h1>
      {favorites.isLoading ? (
        <p role="status" className="py-8 text-center text-sm text-muted-foreground">{t("favorites.loading")}</p>
      ) : favorites.isError ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("favorites.loadFailed")}</p>
          <button type="button" onClick={() => void favorites.refetch()} className="mt-3 min-h-10 rounded-md border border-border px-4 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{t("common.retry")}</button>
        </div>
      ) : tracks.length ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t("favorites.filterLabel")}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder={t("favorites.filterPlaceholder")}
                className="min-h-11 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">{t("favorites.sortLabel")}</span>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-w-44"
              >
                <option value="recent">{t("favorites.sortRecent")}</option>
                <option value="title">{t("favorites.sortTitle")}</option>
                <option value="artist">{t("favorites.sortArtist")}</option>
              </select>
            </label>
          </div>
          {visibleTracks.length ? (
            <section aria-label={t("favorites.title")} className="space-y-3">
              {visibleTracks.map((track, index) => (
            <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={queue} queueIndex={index} />
          ))}
            </section>
          ) : (
            <p role="status" className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t("favorites.noFilterResults")}</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Heart className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">{t("favorites.empty")}</p>
        </div>
      )}
    </main>
  );
}
