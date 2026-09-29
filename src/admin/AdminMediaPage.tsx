import { useTranslation } from "react-i18next";
import { fetchAdminTranscriptions } from "@/services/adminApi";
import type { AdminTranscription } from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { formatAdminDate } from "./adminFormat";
import { ADMIN_MEDIA_FILTERS } from "./adminFilters";

export default function AdminMediaPage() {
  const { i18n } = useTranslation();
  const columns: AdminColumn<AdminTranscription>[] = [
    { key: "track", labelKey: "admin.columns.track", className: "max-w-sm", render: (row) => <div><p className="font-medium text-foreground">{row.title || row.trackId}</p><p className="text-xs text-muted-foreground">{row.artist || row.provider}</p></div> },
    { key: "provider", labelKey: "admin.columns.provider", render: (row) => row.provider },
    { key: "status", labelKey: "admin.columns.status", render: (row) => <AdminStatus value={row.status} /> },
    { key: "progress", labelKey: "admin.columns.progress", render: (row) => `${row.progress}%` },
    { key: "attempts", labelKey: "admin.columns.attempts", render: (row) => row.attempts },
    { key: "createdAt", labelKey: "admin.columns.createdAt", render: (row) => formatAdminDate(row.createdAt, i18n.language) },
  ];
  return <AdminListPage section="media" queryKey="transcriptions" fetchPage={fetchAdminTranscriptions} columns={columns} filters={ADMIN_MEDIA_FILTERS} />;
}
