import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Music2, Play, Shuffle } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import { fetchSharedPlaylist, fetchSharedPlaylistItems } from "@/services/playlistsApi";
import { toPlaybackItem } from "@/components/features/playlists/playlist-playback";
import { ScrollingTrackText } from "@/components/common/ScrollingTrackText";

export default function SharedPlaylistPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { t } = useTranslation();
  const playback = usePlayback();
  const playlist = useQuery({
    queryKey: ["public-playlist", playlistId],
    queryFn: () => fetchSharedPlaylist(playlistId!),
    enabled: Boolean(playlistId),
    retry: false,
  });
  const tracks = useQuery({
    queryKey: ["public-playlist-items", playlistId],
    queryFn: () => fetchSharedPlaylistItems(playlistId!),
    enabled: Boolean(playlistId && playlist.data),
    retry: false,
  });
  const items = tracks.data ?? [];

  function start(shuffle: boolean) {
    const destination = `/shared-playlist/${encodeURIComponent(playlistId ?? "")}`;
    const queue = items.map(({ track }) => toPlaybackItem(track, destination));
    playback.setShuffle(shuffle);
    playback.setQueue(queue);
    if (queue[0]) void playback.play(queue[0]);
  }

  if (playlist.isPending || tracks.isPending) {
    return <main className="mx-auto grid min-h-dvh max-w-3xl place-items-center px-5 py-12 text-sm text-muted-foreground">{t("playlists.sharedLoading")}</main>;
  }

  if (playlist.isError || tracks.isError || !playlist.data) {
    return (
      <main className="mx-auto grid min-h-dvh max-w-xl place-items-center px-5 py-12">
        <section className="w-full rounded-2xl border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{t("playlists.sharedUnavailable")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("playlists.sharedUnavailableDescription")}</p>
        </section>
      </main>
    );
  }

  const cover = playlist.data.coverUrl ?? items.find((item) => item.track.imageUrl)?.track.imageUrl;

  return (
    // This page renders outside AppLayout, so it reserves room for the fixed player itself
    // (player heights: ~181px mobile, ~141px tablet, ~97px desktop).
    <main className="min-h-dvh bg-background px-4 pb-52 pt-8 text-foreground sm:px-8 sm:pb-44 sm:pt-12 xl:pb-32">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-end sm:p-8">
          <div className="grid aspect-square w-36 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary sm:w-48">
            {cover ? <img src={cover} alt="" className="h-full w-full object-cover" /> : <Music2 className="h-12 w-12 text-muted-foreground" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("playlists.sharedLabel")}</p>
            <h1 className="mt-2 break-words text-3xl font-bold sm:text-4xl">{playlist.data.name}</h1>
            {playlist.data.description ? <p className="mt-3 max-w-prose whitespace-pre-wrap text-sm text-muted-foreground">{playlist.data.description}</p> : null}
            <p className="mt-3 text-sm text-muted-foreground">{t("playlists.trackCount", { count: items.length })}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => start(false)} disabled={!items.length} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"><Play className="h-4 w-4" />{t("playlists.playShared")}</button>
              <button type="button" onClick={() => start(true)} disabled={!items.length} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-50"><Shuffle className="h-4 w-4" />{t("playlists.shuffleShared")}</button>
            </div>
          </div>
        </header>

        <ol className="mt-5 space-y-2">
          {items.map(({ id, track }, index) => (
            <li key={id}>
              <button type="button" onClick={() => void playback.play(toPlaybackItem(track, `/shared-playlist/${encodeURIComponent(playlistId ?? "")}`))} title={t("lyrics.playTrack", { title: track.title })} className="group flex w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <span className="w-6 shrink-0 text-center text-xs text-muted-foreground">{index + 1}</span>
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary">{track.imageUrl ? <img src={track.imageUrl} alt="" className="h-full w-full object-cover" /> : <Music2 className="h-4 w-4 text-muted-foreground" />}</div>
                <span className="min-w-0 flex-1"><ScrollingTrackText text={track.title} scrollOnHover className="text-sm font-medium" /><ScrollingTrackText text={track.artists.map((artist) => artist.name).join(", ")} scrollOnHover className="text-xs text-muted-foreground" /></span>
              </button>
            </li>
          ))}
          {!items.length ? <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{t("playlists.noTracks")}</li> : null}
        </ol>
      </div>
    </main>
  );
}
