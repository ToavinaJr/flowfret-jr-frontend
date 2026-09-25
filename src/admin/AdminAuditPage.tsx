import { useTranslation } from "react-i18next";
import { fetchAdminAuditLogs } from "@/services/adminApi";
import type { AdminAuditLog } from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { formatAdminDate } from "./adminFormat";

export default function AdminAuditPage() {
  const { i18n } = useTranslation();
  const columns: AdminColumn<AdminAuditLog>[] = [
    { key: "action", labelKey: "admin.columns.action", render: (row) => <AdminStatus value={row.action} /> },
    { key: "actor", labelKey: "admin.columns.actor", render: (row) => `@${row.actorUsername}` },
    { key: "entity", labelKey: "admin.columns.entity", render: (row) => <div><p>{row.entityType}</p><p className="max-w-52 truncate text-xs text-muted-foreground">{row.entityId || "—"}</p></div> },
    { key: "createdAt", labelKey: "admin.columns.createdAt", render: (row) => formatAdminDate(row.createdAt, i18n.language) },
  ];
  return <AdminListPage section="audit" queryKey="audit" fetchPage={fetchAdminAuditLogs} columns={columns} />;
}
