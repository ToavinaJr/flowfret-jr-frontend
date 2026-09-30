import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { PlaylistList } from "@/components/features/playlists/PlaylistList";
import { PlaylistTracks } from "@/components/features/playlists/PlaylistTracks";
import {
  createPlaylist,
  deletePlaylist,
  fetchPlaylistItems,
  fetchPlaylists,
  removeTrackFromPlaylist,
  reorderPlaylist,
} from "@/services/playlistsApi";
import type { Playlist, PlaylistItem } from "@/types/playlist";
import { useTranslation } from "react-i18next";
import { PlaylistWorkspaceSkeleton } from "@/components/skeletons/AppSkeletons";

export default function PlaylistsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(async (playlist: Playlist) => {
    setSelected(playlist);
    setItems(await fetchPlaylistItems(playlist.id));
  }, []);

  useEffect(() => {
    void fetchPlaylists()
      .then(async (rows) => {
        setPlaylists(rows);
        if (rows[0]) await loadItems(rows[0]);
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : t("common.loadFailed")),
      )
      .finally(() => setLoading(false));
  }, [loadItems, t]);

  async function add(name: string) {
    const created = await createPlaylist(name);
    setPlaylists((current) => [created, ...current]);
    queryClient.setQueryData<Playlist[]>(["my-playlists"], (current = []) => [
      created,
      ...current.filter((playlist) => playlist.id !== created.id),
    ]);
    setSelected(created);
    setItems([]);
    toast.success(t("playlists.created"));
  }

  async function removePlaylist(playlist: Playlist) {
    await deletePlaylist(playlist.id);
    const remaining = playlists.filter((item) => item.id !== playlist.id);
    setPlaylists(remaining);
    queryClient.setQueryData<Playlist[]>(["my-playlists"], (current = []) =>
      current.filter((item) => item.id !== playlist.id),
    );
    if (selected?.id === playlist.id) {
      setSelected(null);
      setItems([]);
      if (remaining[0]) await loadItems(remaining[0]);
    }
    toast.success(t("playlists.deleted"));
  }

  async function removeItem(itemId: string) {
    if (!selected) return;
    await removeTrackFromPlaylist(selected.id, itemId);
    setItems((current) => current.filter((item) => item.id !== itemId));
    setSelected((current) =>
      current ? { ...current, version: current.version + 1 } : current,
    );
  }

  async function reorder(reordered: PlaylistItem[]) {
    if (!selected) return;
    const previous = items;
    setItems(reordered);
    try {
      const updated = await reorderPlaylist(
        selected.id,
        reordered.map((item) => item.id),
        selected.version,
      );
      setSelected(updated);
      setPlaylists((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      setItems(previous);
      toast.error(
        error instanceof Error ? error.message : t("playlists.reorderFailed"),
      );
    }
  }

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("playlists.title")}</h1>
      {loading ? (
        <PlaylistWorkspaceSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
          <PlaylistList
            playlists={playlists}
            selectedId={selected?.id ?? null}
            onSelect={(playlist) => void loadItems(playlist)}
            onCreate={add}
            onDelete={removePlaylist}
          />
          {selected ? (
            <PlaylistTracks
              playlist={selected}
              items={items}
              onRemove={removeItem}
              onReorder={reorder}
            />
          ) : (
            <section className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {t("playlists.selectOrCreate")}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
