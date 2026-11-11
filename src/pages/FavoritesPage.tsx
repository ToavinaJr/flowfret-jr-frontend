import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { FAVORITE_MUSIC_QUERY_KEY } from "@/components/features/music/FavoriteTrackButton";
import { fetchFavoriteMusic } from "@/services/favoriteMusicApi";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";

export default function FavoritesPage() {
  const { t } = useTranslation();
  const favorites = useQuery({ queryKey: FAVORITE_MUSIC_QUERY_KEY, queryFn: fetchFavoriteMusic });
  const tracks = favorites.data ?? [];
  const queue = tracks.map(toMusicPlaybackItem);

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
        <section aria-label={t("favorites.title")} className="space-y-3">
          {tracks.map((track, index) => (
            <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={queue} queueIndex={index} />
          ))}
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Heart className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">{t("favorites.empty")}</p>
        </div>
      )}
    </main>
  );
}
