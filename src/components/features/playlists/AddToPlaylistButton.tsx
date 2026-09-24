import { useState, type FormEvent } from "react";
import { ListPlus, Loader2, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addTrackToPlaylist,
  createPlaylist,
  fetchPlaylists,
} from "@/services/playlistsApi";
import type { MusicTrack } from "@/types/music";
import type { Playlist } from "@/types/playlist";

export function AddToPlaylistButton({ track }: { track: MusicTrack }) {
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
      toast.success(`Morceau ajouté à « ${playlist.name} »`);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ajout à la playlist impossible",
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
      toast.success(`Playlist « ${playlist.name} » créée avec ce morceau`);
      setName("");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Création de la playlist impossible",
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
          aria-label={`Ajouter ${track.title} à une playlist`}
        >
          <ListPlus className="h-4 w-4" />
          <span className="hidden sm:inline">Playlist</span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter à une playlist</DialogTitle>
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
            Réessayer de charger les playlists
          </button>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                disabled={loadingId !== null}
                onClick={() => void add(playlist)}
                className="flex min-h-11 w-full items-center justify-between rounded-md border border-border px-3 text-left text-sm hover:bg-secondary disabled:opacity-50"
              >
                <span className="truncate">{playlist.name}</span>
                {loadingId === playlist.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </button>
            ))}
            {!playlists.length ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                Vous n’avez pas encore de playlist.
              </p>
            ) : null}
          </div>
        )}

        <form onSubmit={createAndAdd} className="flex gap-2 border-t pt-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            placeholder="Nouvelle playlist"
            className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!name.trim() || loadingId !== null}
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loadingId === "new" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Créer"
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
