import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Playlist } from "@/types/playlist";
import { useTranslation } from "react-i18next";

interface PlaylistListProps {
  playlists: Playlist[];
  selectedId: string | null;
  onSelect: (playlist: Playlist) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (playlist: Playlist) => Promise<void>;
}

export function PlaylistList({
  playlists,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: PlaylistListProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

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
      <div className="space-y-1">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className={`flex min-w-0 items-center rounded-md ${playlist.id === selectedId ? "bg-secondary text-foreground" : "hover:bg-secondary"}`}
          >
            <button
              type="button"
              onClick={() => onSelect(playlist)}
              className="min-h-11 min-w-0 flex-1 truncate px-3 text-left text-sm font-medium"
            >
              {playlist.name}
            </button>
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
