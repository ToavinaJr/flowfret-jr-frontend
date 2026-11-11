import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { PlaylistList } from "@/components/features/playlists/PlaylistList";
import { PlaylistTracks } from "@/components/features/playlists/PlaylistTracks";
import {
  createPlaylist,
  addTrackToPlaylist,
  deletePlaylist,
  fetchPlaylistItems,
  fetchPlaylists,
  removeTrackFromPlaylist,
  reorderPlaylist,
  updatePlaylist,
} from "@/services/playlistsApi";
import type { Playlist, PlaylistItem } from "@/types/playlist";
import { useTranslation } from "react-i18next";
import { PlaylistWorkspaceSkeleton } from "@/components/skeletons/PlaylistWorkspaceSkeleton";

export default function PlaylistsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Playlist | null>(null);
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<"updated" | "name">("updated");
  const sortedPlaylists = useMemo(() => [...playlists].sort((left, right) => sortMode === "name"
    ? left.name.localeCompare(right.name)
    : new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()), [playlists, sortMode]);

  const loadItems = useCallback(async (playlist: Playlist) => {
    setSelected(playlist);
    const loaded: PlaylistItem[] = [];
    let after: string | undefined;
    while (true) {
      const page = await fetchPlaylistItems(playlist.id, after);
      loaded.push(...page);
      if (page.length < 100) break;
      after = page[page.length - 1]?.id;
      if (!after) break;
    }
    setItems(loaded);
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

  async function renamePlaylist(playlist: Playlist, name: string) {
    try {
      const updated = await updatePlaylist(playlist.id, { name });
      setPlaylists((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelected((current) => current?.id === updated.id ? updated : current);
      queryClient.setQueryData<Playlist[]>(["my-playlists"], (current = []) =>
        current.map((item) => item.id === updated.id ? updated : item),
      );
      toast.success(t("playlists.renamed"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("playlists.renameFailed"));
      throw error;
    }
  }

  async function updatePlaylistDescription(description: string) {
    if (!selected) return;
    try {
      const updated = await updatePlaylist(selected.id, { description: description || null });
      setPlaylists((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelected(updated);
      queryClient.setQueryData<Playlist[]>(["my-playlists"], (current = []) =>
        current.map((item) => item.id === updated.id ? updated : item),
      );
      toast.success(t("playlists.descriptionUpdated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("playlists.descriptionUpdateFailed"));
      throw error;
    }
  }

  async function removeItem(itemId: string) {
    if (!selected) return;
    await removeTrackFromPlaylist(selected.id, itemId);
    setItems((current) => current.filter((item) => item.id !== itemId));
    setSelected((current) =>
      current ? { ...current, version: current.version + 1 } : current,
    );
  }

  async function removeItems(itemIds: string[]) {
    if (!selected) return;
    let removedCount = 0;
    try {
      for (const itemId of itemIds) {
        await removeTrackFromPlaylist(selected.id, itemId);
        removedCount += 1;
      }
    } finally {
      if (removedCount > 0) {
        const removedIds = new Set(itemIds.slice(0, removedCount));
        setItems((current) => current.filter((item) => !removedIds.has(item.id)));
        setSelected((current) => current ? { ...current, version: current.version + removedCount } : current);
      }
    }
  }

  async function duplicatePlaylist() {
    if (!selected) return;
    const source = selected;
    let copy: Playlist | null = null;
    try {
      copy = await createPlaylist(t("playlists.copyName", { name: source.name }), { description: source.description, coverUrl: source.coverUrl });
      for (const item of items) await addTrackToPlaylist(copy.id, item.track);
      const updatedCopy = await updatePlaylist(copy.id, { visibility: "PRIVATE" });
      setPlaylists((current) => [updatedCopy, ...current]);
      queryClient.setQueryData<Playlist[]>(["my-playlists"], (current = []) => [updatedCopy, ...current]);
      await loadItems(updatedCopy);
      toast.success(t("playlists.duplicated"));
    } catch (error) {
      if (copy) await deletePlaylist(copy.id).catch(() => undefined);
      toast.error(error instanceof Error ? error.message : t("playlists.duplicateFailed"));
    }
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
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
          <PlaylistList
            playlists={sortedPlaylists}
            selectedId={selected?.id ?? null}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            onSelect={(playlist) => void loadItems(playlist)}
            onCreate={add}
            onDelete={removePlaylist}
            onRename={renamePlaylist}
          />
          {selected ? (
            <PlaylistTracks
              playlist={selected}
              items={items}
              onRemove={removeItem}
              onRemoveMany={removeItems}
              onReorder={reorder}
              onDuplicate={duplicatePlaylist}
              onUpdateDescription={updatePlaylistDescription}
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
