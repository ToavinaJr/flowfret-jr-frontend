import { useState } from "react";
import { ListPlus } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { addTrackToPlaylist, fetchPlaylists } from "@/services/playlistsApi";
import type { MusicTrack } from "@/types/music";

export function AddToPlaylistButton({ track }: { track: MusicTrack }) {
  const [loading, setLoading] = useState(false);
  const { data: playlists = [] } = useQuery({
    queryKey: ["my-playlists"],
    queryFn: fetchPlaylists,
    staleTime: 60_000,
  });

  async function add(playlistId: string) {
    if (!playlistId) return;
    setLoading(true);
    try {
      await addTrackToPlaylist(playlistId, track);
      toast.success("Morceau ajouté à la playlist");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ajout à la playlist impossible",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!playlists.length) return null;
  return (
    <label className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-xs text-muted-foreground">
      <ListPlus className="h-4 w-4" />
      <span className="sr-only">Ajouter à une playlist</span>
      <select
        value=""
        disabled={loading}
        onChange={(event) => void add(event.target.value)}
        className="bg-transparent outline-none"
        aria-label="Ajouter à une playlist"
      >
        <option value="">Ajouter à…</option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.name}
          </option>
        ))}
      </select>
    </label>
  );
}
