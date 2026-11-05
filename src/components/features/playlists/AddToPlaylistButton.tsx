import { useState, type FormEvent } from "react";
import { ListPlus, Loader2, Plus } from "lucide-react";
import { PopupTitle } from "@/components/ui/PopupTitle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addTrackToPlaylist,
  createPlaylist,
  fetchPlaylists,
} from "@/services/playlistsApi";
import type { MusicTrack } from "@/types/music";
import type { Playlist } from "@/types/playlist";
import { useTranslation } from "react-i18next";

export function AddToPlaylistButton({ track }: { track: MusicTrack }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const playlistsQuery = useQuery({
    queryKey: ["my-playlists"],
    queryFn: fetchPlaylists,
    staleTime: 60_000,
    enabled: open,
  });
  const playlists = playlistsQuery.data ?? [];

  async function add(playlist: Playlist) {
    setLoadingId(playlist.id);
    try {
      await addTrackToPlaylist(playlist.id, track);
      toast.success(t("playlists.trackAdded", { name: playlist.name }));
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("playlists.addFailed"),
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function createAndAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoadingId("new");
    try {
      const playlist = await createPlaylist(trimmed);
      queryClient.setQueryData<Playlist[]>(["my-playlists"], (current = []) => [
        playlist,
        ...current,
      ]);
      await addTrackToPlaylist(playlist.id, track);
      toast.success(t("playlists.createdWithTrack", { name: playlist.name }));
      setName("");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("playlists.createFailed"),
      );
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label={t("playlists.addNamed", { title: track.title })}
        >
          <ListPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("playlists.playlist")}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md min-w-0 flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <PopupTitle icon={ListPlus}>{t("playlists.addToPlaylist")}</PopupTitle>
          <DialogDescription className="truncate">
            {track.title}
          </DialogDescription>
        </DialogHeader>

        {playlistsQuery.isLoading ? (
          <div className="flex min-h-24 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : playlistsQuery.isError ? (
          <button
            type="button"
            onClick={() => void playlistsQuery.refetch()}
            className="min-h-11 rounded-md border border-border px-4 text-sm"
          >
            {t("playlists.retryLoad")}
          </button>
        ) : (
          <div className="min-h-0 space-y-2 overflow-y-auto">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                disabled={loadingId !== null}
                onClick={() => void add(playlist)}
                className="flex min-h-11 w-full items-center justify-between rounded-md border border-border px-3 text-left text-sm hover:bg-secondary disabled:opacity-50"
              >
                <span className="min-w-0 truncate">{playlist.name}</span>
                {loadingId === playlist.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            ))}
            {!playlists.length ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                {t("playlists.noneYet")}
              </p>
            ) : null}
          </div>
        )}

        <form
          onSubmit={createAndAdd}
          className="grid min-w-0 shrink-0 grid-cols-1 gap-2 border-t pt-4 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <input
            id="new-playlist-dialog-name"
            name="playlistName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            placeholder={t("playlists.newPlaceholder")}
            className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!name.trim() || loadingId !== null}
            className="min-h-11 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50 sm:w-auto"
          >
            {loadingId === "new" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("playlists.create")
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
