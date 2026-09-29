import { useTranslation } from "react-i18next";
import { fetchAdminAuditLogs } from "@/services/adminApi";
import type { AdminAuditLog } from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { formatAdminDate } from "./adminFormat";
import { ADMIN_AUDIT_FILTERS } from "./adminFilters";

export default function AdminAuditPage() {
  const { i18n, t } = useTranslation();
  const columns: AdminColumn<AdminAuditLog>[] = [
    { key: "action", labelKey: "admin.columns.action", render: (row) => <AdminStatus value={row.action} /> },
    { key: "actor", labelKey: "admin.columns.actor", render: (row) => <div><p>@{row.actorUsername}</p><p className="max-w-44 truncate text-xs text-muted-foreground" title={row.actorId}>{row.actorId}</p></div> },
    { key: "entity", labelKey: "admin.columns.entity", render: (row) => <div><p>{row.entityType}</p><p className="max-w-52 truncate text-xs text-muted-foreground">{row.entityId || "—"}</p></div> },
    { key: "createdAt", labelKey: "admin.columns.createdAt", render: (row) => formatAdminDate(row.createdAt, i18n.language) },
    { key: "metadata", labelKey: "admin.columns.metadata", render: (row) => { const serialized = JSON.stringify(row.metadata, null, 2); const hasMetadata = serialized !== "{}" && serialized !== "null" && serialized !== undefined; return <details className="max-w-72"><summary className="cursor-pointer text-primary">{hasMetadata ? t("admin.audit.details") : t("admin.audit.noDetails")}</summary>{hasMetadata ? <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded bg-secondary/60 p-2 text-xs">{serialized}</pre> : null}</details>; } },
  ];
  return <AdminListPage section="audit" queryKey="audit" fetchPage={fetchAdminAuditLogs} columns={columns} filters={ADMIN_AUDIT_FILTERS} showIncludeDeleted={false} />;
}
