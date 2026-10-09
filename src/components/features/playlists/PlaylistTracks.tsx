import { ArrowDown, ArrowUp, Play, Shuffle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { usePlayback } from "@/contexts/usePlayback";
import type { Playlist, PlaylistItem } from "@/types/playlist";
import { toPlaybackItem } from "./playlist-playback";
import { useTranslation } from "react-i18next";

interface PlaylistTracksProps {
  playlist: Playlist;
  items: PlaylistItem[];
  onRemove: (itemId: string) => Promise<void>;
  onReorder: (items: PlaylistItem[]) => Promise<void>;
}

export function PlaylistTracks({
  playlist,
  items,
  onRemove,
  onReorder,
}: PlaylistTracksProps) {
  const { t } = useTranslation();
  const playback = usePlayback();
  const [genre, setGenre] = useState("ALL");
  const genres = useMemo(
    () =>
      [...new Set(items.map((item) => item.track.genre).filter(Boolean))] as string[],
    [items],
  );
  const visible = genre === "ALL" ? items : items.filter(
    (item) => item.track.genre === genre,
  );

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    await onReorder(reordered);
  }

  function start(shuffle: boolean) {
    const queue = visible.map((item) => toPlaybackItem(item.track));
    playback.setShuffle(shuffle);
    playback.setQueue(queue);
    if (queue[0]) void playback.play(queue[0]);
  }

  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4">
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <div className="mr-auto min-w-0">
          <h2 className="truncate text-lg font-semibold">{playlist.name}</h2>
          <p className="text-xs text-muted-foreground">
            {t("playlists.trackCount", { count: items.length })}
          </p>
        </div>
        <select
          id="playlist-genre-filter"
          name="genre"
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          aria-label={t("playlists.filterGenre")}
          className="min-h-10 rounded-md border border-border bg-secondary px-3 text-sm"
        >
          <option value="ALL">{t("playlists.allGenres")}</option>
          {genres.map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={!visible.length}
          onClick={() => start(false)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
        >
          <Play className="h-4 w-4" /> {t("player.play")}
        </button>
        <button
          type="button"
          disabled={!visible.length}
          onClick={() => start(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm disabled:opacity-50"
        >
          <Shuffle className="h-4 w-4" /> {t("mediaPlayer.shuffle")}
        </button>
      </header>
      <div className="space-y-2">
        {visible.map((item) => {
          const originalIndex = items.findIndex((candidate) => candidate.id === item.id);
          return (
            <article key={item.id} className="flex items-center gap-3 rounded-lg bg-secondary p-2">
              <button
                type="button"
                onClick={() => void playback.play(toPlaybackItem(item.track))}
                aria-label={t("lyrics.playTrack", { title: item.track.title })}
                className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-card"
              >
                {item.track.imageUrl ? (
                  <img src={item.track.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.track.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.track.artists.map((artist) => artist.name).join(", ")}
                  {item.track.genre ? ` · ${item.track.genre}` : ""}
                </p>
              </div>
              <button type="button" disabled={originalIndex === 0} onClick={() => void move(originalIndex, -1)} aria-label={t("playlists.moveUp")} className="p-2 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" disabled={originalIndex === items.length - 1} onClick={() => void move(originalIndex, 1)} aria-label={t("playlists.moveDown")} className="p-2 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => void onRemove(item.id)} aria-label={t("playlists.removeTrack")} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </article>
          );
        })}
        {!visible.length && <p className="py-8 text-center text-sm text-muted-foreground">{t("playlists.noTracks")}</p>}
      </div>
    </section>
  );
}
