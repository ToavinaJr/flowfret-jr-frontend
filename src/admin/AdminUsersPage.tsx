import { useTranslation } from "react-i18next";
import { fetchAdminUsers } from "@/services/adminApi";
import type { AdminUser } from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { formatAdminDate } from "./adminFormat";
import { ADMIN_USER_FILTERS } from "./adminFilters";

export default function AdminUsersPage() {
  const { i18n } = useTranslation();
  const columns: AdminColumn<AdminUser>[] = [
    {
      key: "user",
      labelKey: "admin.columns.user",
      render: (row) => (
        <div className="min-w-48">
          <p className="font-medium text-foreground">{row.displayName || row.username}</p>
          <p className="text-xs text-muted-foreground">@{row.username} · {row.email}</p>
        </div>
      ),
    },
    { key: "role", labelKey: "admin.columns.role", render: (row) => <AdminStatus value={row.role} /> },
    { key: "status", labelKey: "admin.columns.status", render: (row) => <AdminStatus value={row.status} /> },
    { key: "createdAt", labelKey: "admin.columns.createdAt", render: (row) => formatAdminDate(row.createdAt, i18n.language) },
    { key: "lastLogin", labelKey: "admin.columns.lastLogin", render: (row) => row.lastLoginAt ? formatAdminDate(row.lastLoginAt, i18n.language) : "—" },
  ];
  return <AdminListPage section="users" queryKey="users" fetchPage={fetchAdminUsers} columns={columns} filters={ADMIN_USER_FILTERS} />;
}
