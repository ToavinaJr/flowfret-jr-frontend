import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Clock3, Heart, ListMusic, Music2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { FAVORITE_MUSIC_QUERY_KEY } from "@/components/features/music/FavoriteTrackButton";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { fetchFavoriteMusic } from "@/services/favoriteMusicApi";
import { fetchListeningHistory } from "@/services/listeningHistoryApi";
import { fetchPlaylists } from "@/services/playlistsApi";
import type { MusicTrack } from "@/types/music";

const HISTORY_PAGE_SIZE = 10;
const PREVIEW_SIZE = 4;

function trackQueue(tracks: MusicTrack[]) {
  return tracks.map((track) => toMusicPlaybackItem(track));
}

export default function LibraryPage() {
  const { t } = useTranslation();
  const history = useInfiniteQuery({
    queryKey: ["listening-history"],
    queryFn: ({ pageParam }) => fetchListeningHistory(HISTORY_PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.length === HISTORY_PAGE_SIZE ? pages.length * HISTORY_PAGE_SIZE : undefined,
    staleTime: 30_000,
  });
  const favorites = useQuery({ queryKey: FAVORITE_MUSIC_QUERY_KEY, queryFn: fetchFavoriteMusic });
  const playlists = useQuery({ queryKey: ["my-playlists"], queryFn: fetchPlaylists });
  const recentTracks = (history.data?.pages.flat() ?? []).slice(0, PREVIEW_SIZE);
  const favoriteTracks = (favorites.data ?? []).slice(0, PREVIEW_SIZE);

  return (
    <main className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("library.title")}</h1>
      <div className="space-y-8">
        <LibrarySection title={t("library.recentTitle")} icon={<Clock3 aria-hidden="true" className="h-5 w-5" />} href="/music" linkLabel={t("library.viewHistory")}>
          {history.isLoading ? <p role="status" className="text-sm text-muted-foreground">{t("library.loading")}</p> : history.isError ? <Retry message={t("library.historyFailed")} onRetry={() => void history.refetch()} retryLabel={t("common.retry")} /> : recentTracks.length ? <div className="space-y-3">{recentTracks.map((track, index) => <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={trackQueue(recentTracks)} queueIndex={index} />)}</div> : <Empty message={t("library.historyEmpty")} />}
        </LibrarySection>

        <LibrarySection title={t("library.favoritesTitle")} icon={<Heart aria-hidden="true" className="h-5 w-5" />} href="/favorites" linkLabel={t("library.viewFavorites")}>
          {favorites.isLoading ? <p role="status" className="text-sm text-muted-foreground">{t("library.loading")}</p> : favorites.isError ? <Retry message={t("library.favoritesFailed")} onRetry={() => void favorites.refetch()} retryLabel={t("common.retry")} /> : favoriteTracks.length ? <div className="space-y-3">{favoriteTracks.map((track, index) => <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={trackQueue(favoriteTracks)} queueIndex={index} />)}</div> : <Empty message={t("library.favoritesEmpty")} />}
        </LibrarySection>

        <LibrarySection title={t("library.playlistsTitle")} icon={<ListMusic aria-hidden="true" className="h-5 w-5" />} href="/playlists" linkLabel={t("library.viewPlaylists")}>
          {playlists.isLoading ? <p role="status" className="text-sm text-muted-foreground">{t("library.loading")}</p> : playlists.isError ? <Retry message={t("library.playlistsFailed")} onRetry={() => void playlists.refetch()} retryLabel={t("common.retry")} /> : playlists.data?.length ? <ul className="grid gap-3 sm:grid-cols-2">{playlists.data.slice(0, 6).map((playlist) => <li key={playlist.id}><Link to="/playlists" className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Music2 className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 truncate font-medium">{playlist.name}</span><span className="ml-auto text-xs text-muted-foreground">{playlist.visibility === "PRIVATE" ? t("library.private") : t("library.shared")}</span></Link></li>)}</ul> : <Empty message={t("library.playlistsEmpty")} />}
        </LibrarySection>
      </div>
    </main>
  );
}

function LibrarySection({ title, icon, href, linkLabel, children }: { title: string; icon: React.ReactNode; href: string; linkLabel: string; children: React.ReactNode }) {
  return <section aria-label={title} className="space-y-3"><div className="flex items-center gap-2"><span className="text-muted-foreground">{icon}</span><h2 className="text-lg font-semibold">{title}</h2><Link to={href} className="ml-auto inline-flex min-h-10 items-center gap-1 rounded-md px-2 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{linkLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>{children}</section>;
}

function Empty({ message }: { message: string }) {
  return <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{message}</div>;
}

function Retry({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel: string }) {
  return <div className="rounded-xl border border-border p-5 text-center"><p className="text-sm text-muted-foreground">{message}</p><button type="button" onClick={onRetry} className="mt-2 min-h-10 rounded-md border border-border px-4 text-sm hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{retryLabel}</button></div>;
}
