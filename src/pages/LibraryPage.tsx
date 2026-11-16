import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, Heart, ListMusic, Music2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { MusicMediaPlayer } from "@/components/features/music/MusicMediaPlayer";
import { FavoriteTrackButton } from "@/components/features/music/FavoriteTrackButton";
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
  const recentQueue = trackQueue(recentTracks);
  const favoriteQueue = trackQueue(favoriteTracks);
  const featuredTrack = recentTracks[0];

  return (
    <main className={`${PAGE_SHELL} max-w-5xl lg:max-w-5xl`}>
      <header className="mb-8 border-b border-border/70 pb-6 sm:mb-10 sm:pb-8">
        <p className="mb-2 text-sm text-muted-foreground">{t("library.eyebrow")}</p>
        <h1 className={`${PAGE_TITLE} mb-2`}>{t("library.title")}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{t("library.intro")}</p>
      </header>

      <div className="space-y-10 sm:space-y-12">
        <section aria-label={t("library.recentTitle")} className="space-y-4">
          <SectionHeading title={t("library.recentTitle")} icon={<Clock3 aria-hidden="true" />} href="/music" linkLabel={t("library.viewHistory")} />
          {history.isLoading ? (
            <LoadingState label={t("library.loading")} />
          ) : history.isError ? (
            <Retry message={t("library.historyFailed")} onRetry={() => void history.refetch()} retryLabel={t("common.retry")} />
          ) : featuredTrack ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="grid items-center gap-5 p-4 sm:grid-cols-[minmax(12rem,0.8fr)_1.2fr] sm:gap-8 sm:p-6">
                <div className="relative aspect-square w-full max-w-72 overflow-hidden rounded-xl bg-secondary sm:aspect-[5/4] sm:max-w-none">
                  <img
                    src={featuredTrack.imageUrl ?? "/placeholder.svg"}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/placeholder.svg";
                    }}
                    alt={t("music.albumCoverAlt", { title: featuredTrack.title })}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="mb-3 text-sm text-muted-foreground">{t("library.resume")}</p>
                  <h2 className="text-xl font-medium leading-tight text-foreground sm:text-2xl">{featuredTrack.title}</h2>
                  <p className="mt-2 truncate text-sm text-muted-foreground sm:text-base">
                    {featuredTrack.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <div className="mt-6 flex items-center gap-2 border-t border-border/70 pt-4">
                    <MusicMediaPlayer track={featuredTrack} playbackQueue={recentQueue} queueIndex={0} />
                    <FavoriteTrackButton track={featuredTrack} />
                  </div>
                </div>
              </div>
              {recentTracks.length > 1 ? (
                <div className="space-y-3 border-t border-border/70 bg-background/40 p-3 sm:p-4">
                  {recentTracks.slice(1).map((track, index) => (
                    <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={recentQueue} queueIndex={index + 1} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <Empty icon={<Clock3 aria-hidden="true" />} message={t("library.historyEmpty")} />
          )}
        </section>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-8">
          <section aria-label={t("library.favoritesTitle")} className="min-w-0 space-y-4">
            <SectionHeading title={t("library.favoritesTitle")} icon={<Heart aria-hidden="true" />} href="/favorites" linkLabel={t("library.viewFavorites")} />
            {favorites.isLoading ? (
              <LoadingState label={t("library.loading")} />
            ) : favorites.isError ? (
              <Retry message={t("library.favoritesFailed")} onRetry={() => void favorites.refetch()} retryLabel={t("common.retry")} />
            ) : favoriteTracks.length ? (
              <div className="space-y-3">
                {favoriteTracks.map((track, index) => (
                  <MusicTrackCard key={`${track.provider}:${track.providerTrackId}`} track={track} playbackQueue={favoriteQueue} queueIndex={index} />
                ))}
              </div>
            ) : (
              <Empty icon={<Heart aria-hidden="true" />} message={t("library.favoritesEmpty")} />
            )}
          </section>

          <section aria-label={t("library.playlistsTitle")} className="min-w-0 space-y-4">
            <SectionHeading title={t("library.playlistsTitle")} icon={<ListMusic aria-hidden="true" />} href="/playlists" linkLabel={t("library.viewPlaylists")} />
            {playlists.isLoading ? (
              <LoadingState label={t("library.loading")} />
            ) : playlists.isError ? (
              <Retry message={t("library.playlistsFailed")} onRetry={() => void playlists.refetch()} retryLabel={t("common.retry")} />
            ) : playlists.data?.length ? (
              <ul className="space-y-2">
                {playlists.data.slice(0, 6).map((playlist) => (
                  <li key={playlist.id}>
                    <Link to="/playlists" className="group flex min-h-[76px] items-center gap-4 rounded-xl border border-border/70 bg-card p-3 transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary text-muted-foreground">
                        {playlist.coverUrl ? <img src={playlist.coverUrl} alt="" className="h-full w-full object-cover" /> : <Music2 className="h-5 w-5" aria-hidden="true" />}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">{playlist.name}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{playlist.visibility === "PRIVATE" ? t("library.private") : t("library.shared")}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty icon={<ListMusic aria-hidden="true" />} message={t("library.playlistsEmpty")} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ title, icon, href, linkLabel }: { title: string; icon: React.ReactNode; href: string; linkLabel: string }) {
  return (
    <div className="flex min-h-10 items-center gap-3">
      <span className="text-muted-foreground [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</span>
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <Link to={href} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {linkLabel}<ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

function Empty({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex min-h-28 items-center gap-4 rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
      <span className="text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <p>{message}</p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return <p role="status" className="rounded-xl border border-border/70 bg-card px-4 py-5 text-sm text-muted-foreground">{label}</p>;
}

function Retry({ message, onRetry, retryLabel }: { message: string; onRetry: () => void; retryLabel: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5">
      <p className="text-sm text-muted-foreground">{message}</p>
      <button type="button" onClick={onRetry} className="mt-3 min-h-10 rounded-md border border-border px-4 text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{retryLabel}</button>
    </div>
  );
}
