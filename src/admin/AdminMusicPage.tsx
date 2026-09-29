import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchAdminCatalogTracks,
  fetchAdminListeningHistory,
  fetchAdminPlaylists,
} from "@/services/adminApi";
import type {
  AdminCatalogTrack,
  AdminListeningHistory,
  AdminPlaylist,
} from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { AdminResourceTabs } from "./AdminResourceTabs";
import {
  formatAdminArtists,
  formatAdminDate,
  formatAdminDurationMs,
  formatAdminNumber,
  truncateAdminText,
} from "./adminFormat";
import { ADMIN_PROVIDER_FILTERS } from "./adminFilters";

const MUSIC_TABS = [
  { value: "playlists", labelKey: "admin.resources.playlists.tab" },
  { value: "catalog", labelKey: "admin.resources.catalog.tab" },
  { value: "history", labelKey: "admin.resources.history.tab" },
];

export default function AdminMusicPage() {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const view = MUSIC_TABS.some((tab) => tab.value === requestedView)
    ? requestedView!
    : "playlists";

  const playlistColumns: AdminColumn<AdminPlaylist>[] = [
    {
      key: "name",
      labelKey: "admin.columns.playlist",
      className: "max-w-sm",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">
            {truncateAdminText(row.description, 60)}
          </p>
        </div>
      ),
    },
    {
      key: "owner",
      labelKey: "admin.columns.owner",
      render: (row) => `@${row.username}`,
    },
    {
      key: "visibility",
      labelKey: "admin.columns.visibility",
      render: (row) => row.visibility,
    },
    {
      key: "items",
      labelKey: "admin.columns.items",
      render: (row) => row.itemCount,
    },
    {
      key: "createdAt",
      labelKey: "admin.columns.createdAt",
      render: (row) => formatAdminDate(row.createdAt, i18n.language),
    },
  ];

  const catalogColumns: AdminColumn<AdminCatalogTrack>[] = [
    {
      key: "track",
      labelKey: "admin.columns.track",
      className: "max-w-sm",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">
            {truncateAdminText(row.title, 100)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatAdminArtists(row.artists)}
          </p>
        </div>
      ),
    },
    {
      key: "provider",
      labelKey: "admin.columns.provider",
      render: (row) => <AdminStatus value={row.provider} />,
    },
    {
      key: "album",
      labelKey: "admin.resourceColumns.album",
      render: (row) => row.album || "—",
    },
    {
      key: "genre",
      labelKey: "admin.resourceColumns.genre",
      render: (row) => row.genre || "—",
    },
    {
      key: "duration",
      labelKey: "admin.resourceColumns.duration",
      render: (row) => formatAdminDurationMs(row.durationMs),
    },
    {
      key: "playlists",
      labelKey: "admin.resourceColumns.playlistCount",
      render: (row) => formatAdminNumber(row.playlistCount, i18n.language),
    },
  ];

  const historyColumns: AdminColumn<AdminListeningHistory>[] = [
    {
      key: "track",
      labelKey: "admin.columns.track",
      className: "max-w-sm",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">
            {truncateAdminText(row.title, 100)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatAdminArtists(row.artists)}
          </p>
        </div>
      ),
    },
    {
      key: "owner",
      labelKey: "admin.columns.owner",
      render: (row) => `@${row.username}`,
    },
    {
      key: "provider",
      labelKey: "admin.columns.provider",
      render: (row) => <AdminStatus value={row.provider} />,
    },
    {
      key: "playCount",
      labelKey: "admin.resourceColumns.playCount",
      render: (row) => formatAdminNumber(row.playCount, i18n.language),
    },
    {
      key: "lastPlayedAt",
      labelKey: "admin.resourceColumns.lastPlayedAt",
      render: (row) => formatAdminDate(row.lastPlayedAt, i18n.language),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminResourceTabs
        basePath="/admin/music"
        active={view}
        tabs={MUSIC_TABS}
      />
      {view === "catalog" ? (
        <AdminListPage
          section="music"
          queryKey="catalog-tracks"
          titleKey="admin.resources.catalog.title"
          descriptionKey="admin.resources.catalog.description"
          fetchPage={fetchAdminCatalogTracks}
          columns={catalogColumns}
          filters={ADMIN_PROVIDER_FILTERS}
          showIncludeDeleted={false}
        />
      ) : view === "history" ? (
        <AdminListPage
          section="music"
          queryKey="listening-history"
          titleKey="admin.resources.history.title"
          descriptionKey="admin.resources.history.description"
          fetchPage={fetchAdminListeningHistory}
          columns={historyColumns}
          filters={ADMIN_PROVIDER_FILTERS}
          showIncludeDeleted={false}
        />
      ) : (
        <AdminListPage
          section="music"
          queryKey="playlists"
          titleKey="admin.resources.playlists.title"
          descriptionKey="admin.resources.playlists.description"
          fetchPage={fetchAdminPlaylists}
          columns={playlistColumns}
        />
      )}
    </div>
  );
}
