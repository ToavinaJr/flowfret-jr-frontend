import { ArrowDown, ArrowUp, Check, Copy, Globe, Link2, Lock, Pencil, Play, Shuffle, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { usePlayback } from "@/contexts/usePlayback";
import type { Playlist, PlaylistItem } from "@/types/playlist";
import { toPlaybackItem } from "./playlist-playback";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ScrollingTrackText } from "@/components/common/ScrollingTrackText";

const OUTLINE_BUTTON =
  "inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50";
const ROW_ICON_BUTTON =
  "grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30";

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

  async function saveDescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = description.trim();
    if (next === (playlist.description ?? "").trim()) {
      setEditingDescription(false);
      toast.info(t("playlists.noChanges"));
      return;
    }
    setSavingDescription(true);
    try {
      await onUpdateDescription(next);
      setEditingDescription(false);
    } catch {
      // Keep the editor open so the user can correct or retry the text.
    } finally {
      setSavingDescription(false);
    }
  }

  async function removeSelected() {
    setBulkWorking(true);
    try {
      await onRemoveMany(selectedIds);
      setSelectedIds([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("playlists.bulkRemoveFailed"));
    } finally {
      setBulkWorking(false);
    }
  }

  function start(shuffle: boolean) {
    const queue = visible.map((item) => toPlaybackItem(item.track));
    playback.setShuffle(shuffle);
    playback.setQueue(queue);
    if (queue[0]) void playback.play(queue[0]);
  }

  const editDescriptionLabel = t(playlist.description ? "playlists.editDescription" : "playlists.addDescription");

  return (
    <section className="min-w-0 rounded-xl border border-border bg-card p-4">
      <header className="mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="break-words text-lg font-semibold leading-tight">{playlist.name}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              {playlist.visibility === "PUBLIC" ? <Globe className="h-3.5 w-3.5" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              <span>{t(playlist.visibility === "PUBLIC" ? "playlists.visibilityPublic" : "playlists.visibilityPrivate")}</span>
              <span aria-hidden="true">·</span>
              <span>{t("playlists.trackCount", { count: items.length })}</span>
            </p>
          </div>
          <button type="button" onClick={() => void onDuplicate()} className={`${OUTLINE_BUTTON} shrink-0`} aria-label={t("playlists.duplicate")} title={t("playlists.duplicate")}>
            <Copy className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">{t("playlists.duplicate")}</span>
          </button>
        </div>

        {editingDescription ? (
          <form onSubmit={(event) => void saveDescription(event)} className="flex flex-wrap items-start gap-2">
            <textarea
              autoFocus
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={2}
              aria-label={t("playlists.descriptionLabel")}
              placeholder={t("playlists.descriptionPlaceholder")}
              className="min-h-10 min-w-0 flex-1 basis-56 resize-y rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <div className="flex gap-1">
              <button type="submit" disabled={savingDescription} aria-label={t("playlists.saveDescription")} title={t("playlists.saveDescription")} className="grid h-10 w-10 place-items-center rounded-md text-primary hover:bg-secondary disabled:opacity-50"><Check className="h-4 w-4" /></button>
              <button type="button" disabled={savingDescription} onClick={() => { setDescription(playlist.description ?? ""); setEditingDescription(false); }} aria-label={t("playlists.cancelDescriptionEdit")} title={t("playlists.cancelDescriptionEdit")} className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-50"><X className="h-4 w-4" /></button>
            </div>
          </form>
        ) : playlist.description ? (
          <div className="flex items-start gap-1">
            <p className="min-w-0 max-w-prose flex-1 whitespace-pre-wrap text-sm text-muted-foreground">{playlist.description}</p>
            <button type="button" onClick={() => setEditingDescription(true)} aria-label={editDescriptionLabel} title={editDescriptionLabel} className="-mt-1.5 grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Pencil className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => setEditingDescription(true)} className="inline-flex min-h-8 items-center gap-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {editDescriptionLabel}
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!visible.length}
            onClick={() => start(false)}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
          >
            <Play className="h-4 w-4" aria-hidden="true" /> {t("player.play")}
          </button>
          <button type="button" disabled={!visible.length} onClick={() => start(true)} className={OUTLINE_BUTTON}>
            <Shuffle className="h-4 w-4" aria-hidden="true" /> {t("mediaPlayer.shuffle")}
          </button>
          <select
            id="playlist-genre-filter"
            name="genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            aria-label={t("playlists.filterGenre")}
            title={t("playlists.filterGenre")}
            className="min-h-10 min-w-0 rounded-md border border-border bg-secondary px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="ALL">{t("playlists.allGenres")}</option>
            {genres.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {playlist.visibility === "PUBLIC" ? (
            <>
              <button type="button" onClick={() => void copyShareLink()} className={OUTLINE_BUTTON}>
                <Link2 className="h-4 w-4" aria-hidden="true" /> {t("playlists.copyShareLink")}
              </button>
              <button type="button" disabled={savingVisibility} onClick={() => void setVisibility("PRIVATE")} className={OUTLINE_BUTTON}>
                <Lock className="h-4 w-4" aria-hidden="true" /> {t("playlists.makePrivate")}
              </button>
            </>
          ) : (
            <button type="button" disabled={savingVisibility} onClick={() => void setVisibility("PUBLIC")} className={OUTLINE_BUTTON}>
              <Globe className="h-4 w-4" aria-hidden="true" /> {t("playlists.makePublic")}
            </button>
          )}
          {selectedIds.length ? (
            <button type="button" disabled={bulkWorking} onClick={() => void removeSelected()} className={`${OUTLINE_BUTTON} text-destructive sm:ml-auto`}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> {t("playlists.removeSelected", { count: selectedIds.length })}
            </button>
          ) : null}
        </div>
      </header>
      <div className="space-y-2">
        {visible.map((item) => {
          const originalIndex = items.findIndex((candidate) => candidate.id === item.id);
          const artists = item.track.artists.map((artist) => artist.name).join(", ");
          const subtitle = item.track.genre ? `${artists} · ${item.track.genre}` : artists;
          return (
            <article key={item.id} className="group flex items-center gap-2 rounded-lg bg-secondary p-2 transition-colors hover:bg-secondary/70 sm:gap-3">
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
                aria-label={t("playlists.selectTrack", { title: item.track.title })}
                title={t("playlists.selectTrack", { title: item.track.title })}
                className="h-4 w-4 shrink-0 accent-primary"
              />
              <button
                type="button"
                onClick={() => void playback.play(toPlaybackItem(item.track))}
                aria-label={t("lyrics.playTrack", { title: item.track.title })}
                title={t("lyrics.playTrack", { title: item.track.title })}
                className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {item.track.imageUrl ? (
                  <img src={item.track.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
                <span className={`absolute inset-0 grid place-items-center transition-opacity ${item.track.imageUrl ? "bg-black/40 text-white opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" : "text-foreground"}`}>
                  <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                </span>
              </button>
              <div className="min-w-0 flex-1">
                <ScrollingTrackText text={item.track.title} scrollOnHover className="text-sm font-medium" />
                <ScrollingTrackText text={subtitle} scrollOnHover className="text-xs text-muted-foreground" />
              </div>
              <div className="flex shrink-0 items-center">
                <button type="button" disabled={originalIndex === 0} onClick={() => void move(originalIndex, -1)} aria-label={t("playlists.moveUp")} title={t("playlists.moveUp")} className={ROW_ICON_BUTTON}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={originalIndex === items.length - 1} onClick={() => void move(originalIndex, 1)} aria-label={t("playlists.moveDown")} title={t("playlists.moveDown")} className={ROW_ICON_BUTTON}><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => void onRemove(item.id)} aria-label={t("playlists.removeTrack")} title={t("playlists.removeTrack")} className={`${ROW_ICON_BUTTON} hover:text-destructive`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </article>
          );
        })}
        {!visible.length && <p className="py-8 text-center text-sm text-muted-foreground">{t("playlists.noTracks")}</p>}
      </div>
    </section>
  );
}
