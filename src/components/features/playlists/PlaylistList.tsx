import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Playlist } from "@/types/playlist";
import { useTranslation } from "react-i18next";

interface PlaylistListProps {
  playlists: Playlist[];
  selectedId: string | null;
  onSelect: (playlist: Playlist) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (playlist: Playlist) => Promise<void>;
  onRename: (playlist: Playlist, name: string) => Promise<void>;
  sortMode: "updated" | "name";
  onSortModeChange: (mode: "updated" | "name") => void;
}

export function PlaylistList({
  playlists,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  sortMode,
  onSortModeChange,
}: PlaylistListProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate(name.trim());
      setName("");
    } finally {
      setSaving(false);
    }
  }

  async function submitRename(event: FormEvent<HTMLFormElement>, playlist: Playlist) {
    event.preventDefault();
    const nextName = editedName.trim();
    if (!nextName || nextName === playlist.name) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      await onRename(playlist, nextName);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <aside className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
      <form onSubmit={submit} className="flex gap-2">
        <input
          id="new-playlist-name"
          name="playlistName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          placeholder={t("playlists.newPlaceholder")}
          aria-label={t("playlists.nameLabel")}
          className="min-w-0 flex-1 rounded-md border border-border bg-secondary px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          aria-label={t("playlists.create")}
          className="grid min-h-11 min-w-11 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        {t("playlists.sortLabel")}
        <select value={sortMode} onChange={(event) => onSortModeChange(event.target.value as "updated" | "name")} className="min-h-9 min-w-0 flex-1 rounded-md border border-border bg-secondary px-2 text-foreground">
          <option value="updated">{t("playlists.sortRecentlyUpdated")}</option>
          <option value="name">{t("playlists.sortAlphabetical")}</option>
        </select>
      </label>
      <div className="space-y-1">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`flex min-w-0 items-center rounded-md ${playlist.id === selectedId ? "bg-secondary text-foreground" : "hover:bg-secondary"}`}
          >
            {editingId === playlist.id ? (
              <form onSubmit={(event) => void submitRename(event, playlist)} className="flex min-w-0 flex-1 items-center gap-1 px-2">
                <input
                  autoFocus
                  value={editedName}
                  onChange={(event) => setEditedName(event.target.value)}
                  maxLength={120}
                  aria-label={t("playlists.renameLabel")}
                  className="min-h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
                <button type="submit" disabled={saving || !editedName.trim()} aria-label={t("playlists.saveName")} className="grid h-9 w-8 shrink-0 place-items-center rounded-md text-primary hover:bg-background disabled:opacity-50">
                  <Check className="h-4 w-4" />
                </button>
                <button type="button" disabled={saving} onClick={() => setEditingId(null)} aria-label={t("playlists.cancelRename")} className="grid h-9 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-background disabled:opacity-50">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(playlist)}
                className="min-h-11 min-w-0 flex-1 truncate px-3 text-left text-sm font-medium"
              >
                {playlist.name}
              </button>
            )}
            {editingId !== playlist.id ? (
              <button
                type="button"
                onClick={() => { setEditingId(playlist.id); setEditedName(playlist.name); }}
                aria-label={t("playlists.renameNamed", { name: playlist.name })}
                className="grid min-h-11 min-w-10 place-items-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void onDelete(playlist)}
              aria-label={t("playlists.deleteNamed", { name: playlist.name })}
              className="grid min-h-11 min-w-11 place-items-center text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {!playlists.length && (
          <p className="p-3 text-sm text-muted-foreground">
            {t("playlists.empty")}
          </p>
        )}
      </div>
    </aside>
  );
}
