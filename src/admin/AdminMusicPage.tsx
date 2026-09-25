import { useTranslation } from "react-i18next";
import { fetchAdminPlaylists } from "@/services/adminApi";
import type { AdminPlaylist } from "@/types/admin";
import AdminListPage, { type AdminColumn } from "./AdminListPage";
import { formatAdminDate, truncateAdminText } from "./adminFormat";

export default function AdminMusicPage() {
  const { i18n } = useTranslation();
  const columns: AdminColumn<AdminPlaylist>[] = [
    { key: "name", labelKey: "admin.columns.playlist", className: "max-w-sm", render: (row) => <div><p className="font-medium text-foreground">{row.name}</p><p className="text-xs text-muted-foreground">{truncateAdminText(row.description, 60)}</p></div> },
    { key: "owner", labelKey: "admin.columns.owner", render: (row) => `@${row.username}` },
    { key: "visibility", labelKey: "admin.columns.visibility", render: (row) => row.visibility },
    { key: "items", labelKey: "admin.columns.items", render: (row) => row.itemCount },
    { key: "createdAt", labelKey: "admin.columns.createdAt", render: (row) => formatAdminDate(row.createdAt, i18n.language) },
  ];
  return <AdminListPage section="music" queryKey="playlists" fetchPage={fetchAdminPlaylists} columns={columns} />;
}
