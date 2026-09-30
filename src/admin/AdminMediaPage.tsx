import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchAdminChordTranscriptions,
  fetchAdminTranscriptions,
  fetchAdminUploads,
} from "@/services/adminApi";
import type {
  AdminChordTranscription,
  AdminTranscription,
  AdminUpload,
} from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { AdminResourceTabs } from "./AdminResourceTabs";
import {
  formatAdminBytes,
  formatAdminDate,
  formatAdminDurationSeconds,
  formatAdminNumber,
} from "./adminFormat";
import {
  ADMIN_MEDIA_FILTERS,
  ADMIN_PROVIDER_FILTERS,
  ADMIN_UPLOAD_FILTERS,
} from "./adminFilters";

const MEDIA_TABS = [
  { value: "transcriptions", labelKey: "admin.resources.transcriptions.tab" },
  { value: "uploads", labelKey: "admin.resources.uploads.tab" },
  { value: "chords", labelKey: "admin.resources.chords.tab" },
];

export default function AdminMediaPage() {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const view = MEDIA_TABS.some((tab) => tab.value === requestedView)
    ? requestedView!
    : "transcriptions";

  const transcriptionColumns: AdminColumn<AdminTranscription>[] = [
    {
      key: "track",
      labelKey: "admin.columns.track",
      className: "max-w-sm",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">
            {row.title || row.trackId}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.artist || row.provider}
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
      key: "status",
      labelKey: "admin.columns.status",
      render: (row) => <AdminStatus value={row.status} />,
    },
    {
      key: "progress",
      labelKey: "admin.columns.progress",
      render: (row) => `${row.progress}%`,
    },
    {
      key: "attempts",
      labelKey: "admin.columns.attempts",
      render: (row) => row.attempts,
    },
    {
      key: "createdAt",
      labelKey: "admin.columns.createdAt",
      render: (row) => formatAdminDate(row.createdAt, i18n.language),
    },
  ];

  const uploadColumns: AdminColumn<AdminUpload>[] = [
    {
      key: "file",
      labelKey: "admin.resourceColumns.file",
      className: "max-w-sm",
      render: (row) => (
        <div>
          <p className="break-all font-medium text-foreground">
            {row.fileName}
          </p>
          <p className="text-xs text-muted-foreground">{row.fileType}</p>
        </div>
      ),
    },
    {
      key: "owner",
      labelKey: "admin.columns.owner",
      render: (row) => `@${row.username}`,
    },
    {
      key: "size",
      labelKey: "admin.resourceColumns.fileSize",
      render: (row) => formatAdminBytes(row.fileSize, i18n.language),
    },
    {
      key: "source",
      labelKey: "admin.resourceColumns.source",
      render: (row) => <AdminStatus value={row.sourceType} />,
    },
    {
      key: "status",
      labelKey: "admin.columns.status",
      render: (row) => (
        <div className="space-y-1">
          <AdminStatus value={row.status} />
          {row.cleanupPending ? (
            <p className="text-xs text-destructive">
              {i18n.t("admin.resources.cleanupPending")}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "createdAt",
      labelKey: "admin.columns.createdAt",
      render: (row) => formatAdminDate(row.createdAt, i18n.language),
    },
  ];

  const chordColumns: AdminColumn<AdminChordTranscription>[] = [
    {
      key: "track",
      labelKey: "admin.columns.track",
      className: "w-[34%] max-w-sm",
      render: (row) => (
        <div>
          <p className="font-medium text-foreground [overflow-wrap:anywhere]">
            {row.title || row.providerTrackId}
          </p>
          <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {row.artist || row.providerTrackId}
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
      key: "duration",
      labelKey: "admin.resourceColumns.duration",
      render: (row) => formatAdminDurationSeconds(row.duration, i18n.language),
    },
    {
      key: "cues",
      labelKey: "admin.resourceColumns.cues",
      render: (row) => formatAdminNumber(row.cueCount, i18n.language),
    },
    {
      key: "engine",
      labelKey: "admin.resourceColumns.engine",
      render: (row) => row.engineVersion,
    },
    {
      key: "createdAt",
      labelKey: "admin.columns.createdAt",
      render: (row) => formatAdminDate(row.createdAt, i18n.language),
    },
  ];

  return (
    <div className="space-y-5">
      <AdminResourceTabs
        basePath="/admin/media"
        active={view}
        tabs={MEDIA_TABS}
      />
      {view === "uploads" ? (
        <AdminListPage
          section="media"
          queryKey="uploads"
          titleKey="admin.resources.uploads.title"
          descriptionKey="admin.resources.uploads.description"
          fetchPage={fetchAdminUploads}
          columns={uploadColumns}
          filters={ADMIN_UPLOAD_FILTERS}
        />
      ) : view === "chords" ? (
        <AdminListPage
          section="media"
          queryKey="chord-transcriptions"
          titleKey="admin.resources.chords.title"
          descriptionKey="admin.resources.chords.description"
          fetchPage={fetchAdminChordTranscriptions}
          columns={chordColumns}
          filters={ADMIN_PROVIDER_FILTERS}
          showIncludeDeleted={false}
        />
      ) : (
        <AdminListPage
          section="media"
          queryKey="transcriptions"
          titleKey="admin.resources.transcriptions.title"
          descriptionKey="admin.resources.transcriptions.description"
          fetchPage={fetchAdminTranscriptions}
          columns={transcriptionColumns}
          filters={ADMIN_MEDIA_FILTERS}
        />
      )}
    </div>
  );
}
