import { ArrowDown, ArrowUp, Check, Copy, Link2, Pencil, Play, Share2, Shuffle, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePlayback } from "@/contexts/usePlayback";
import type { Playlist, PlaylistItem } from "@/types/playlist";
import { toPlaybackItem } from "./playlist-playback";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface PlaylistTracksProps {
  playlist: Playlist;
  items: PlaylistItem[];
  onRemove: (itemId: string) => Promise<void>;
  onRemoveMany: (itemIds: string[]) => Promise<void>;
  onReorder: (items: PlaylistItem[]) => Promise<void>;
  onDuplicate: () => Promise<void>;
  onUpdateDescription: (description: string) => Promise<void>;
  onUpdateVisibility: (visibility: "PRIVATE" | "PUBLIC") => Promise<void>;
}

export function PlaylistTracks({
  playlist,
  items,
  onRemove,
  onRemoveMany,
  onReorder,
  onDuplicate,
  onUpdateDescription,
  onUpdateVisibility,
}: PlaylistTracksProps) {
  const { t } = useTranslation();
  const playback = usePlayback();
  const [genre, setGenre] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  useEffect(() => setSelectedIds([]), [playlist.id]);
  useEffect(() => {
    setDescription(playlist.description ?? "");
    setEditingDescription(false);
  }, [playlist.id, playlist.description]);
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

  async function setVisibility(visibility: "PRIVATE" | "PUBLIC") {
    setSavingVisibility(true);
    try {
      await onUpdateVisibility(visibility);
    } catch {
      // The page reports the mutation error to the user.
    } finally {
      setSavingVisibility(false);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/shared-playlist/${encodeURIComponent(playlist.id)}`);
      toast.success(t("playlists.shareLinkCopied"));
    } catch {
      toast.error(t("playlists.shareLinkCopyFailed"));
    }
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
          {editingDescription ? (
            <form onSubmit={async (event) => {
              event.preventDefault();
              setSavingDescription(true);
              try {
                await onUpdateDescription(description.trim());
                setEditingDescription(false);
              } catch {
                // Keep the editor open so the user can correct or retry the text.
              } finally {
                setSavingDescription(false);
              }
            }} className="mt-2 flex flex-wrap items-start gap-2">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={2}
                aria-label={t("playlists.descriptionLabel")}
                className="min-h-10 min-w-48 flex-1 resize-y rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <button type="submit" disabled={savingDescription} aria-label={t("playlists.saveDescription")} className="grid h-10 w-10 place-items-center rounded-md text-primary hover:bg-secondary disabled:opacity-50"><Check className="h-4 w-4" /></button>
              <button type="button" disabled={savingDescription} onClick={() => { setDescription(playlist.description ?? ""); setEditingDescription(false); }} aria-label={t("playlists.cancelDescriptionEdit")} className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-50"><X className="h-4 w-4" /></button>
            </form>
          ) : (
            <div className="mt-1 flex items-start gap-2">
              {playlist.description ? <p className="max-w-prose whitespace-pre-wrap text-sm text-muted-foreground">{playlist.description}</p> : null}
              <button type="button" onClick={() => setEditingDescription(true)} aria-label={t("playlists.editDescription")} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Pencil className="h-4 w-4" /></button>
            </div>
          )}
        </div>
        <button type="button" onClick={() => void onDuplicate()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm">
          <Copy className="h-4 w-4" /> {t("playlists.duplicate")}
        </button>
        {playlist.visibility === "PUBLIC" ? (
          <>
            <button type="button" onClick={() => void copyShareLink()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm">
              <Link2 className="h-4 w-4" /> {t("playlists.copyShareLink")}
            </button>
            <button type="button" disabled={savingVisibility} onClick={() => void setVisibility("PRIVATE")} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm disabled:opacity-50">
              <Share2 className="h-4 w-4" /> {t("playlists.makePrivate")}
            </button>
          </>
        ) : (
          <button type="button" disabled={savingVisibility} onClick={() => void setVisibility("PUBLIC")} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm disabled:opacity-50">
            <Share2 className="h-4 w-4" /> {t("playlists.makePublic")}
          </button>
        )}
        {selectedIds.length ? (
          <button type="button" disabled={bulkWorking} onClick={async () => { setBulkWorking(true); try { await onRemoveMany(selectedIds); setSelectedIds([]); } catch (error) { toast.error(error instanceof Error ? error.message : t("playlists.bulkRemoveFailed")); } finally { setBulkWorking(false); } }} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm text-destructive disabled:opacity-50">
            <Trash2 className="h-4 w-4" /> {t("playlists.removeSelected", { count: selectedIds.length })}
          </button>
        ) : null}
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
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
                aria-label={t("playlists.selectTrack", { title: item.track.title })}
                className="h-4 w-4 accent-primary"
              />
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
