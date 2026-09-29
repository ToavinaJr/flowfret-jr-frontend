import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchAdminPosts } from "@/services/adminApi";
import type { AdminPost } from "@/types/admin";
import AdminListPage, { AdminStatus, type AdminColumn } from "./AdminListPage";
import { formatAdminDate, truncateAdminText } from "./adminFormat";
import { ADMIN_CONTENT_FILTERS } from "./adminFilters";

export default function AdminContentPage() {
  const { i18n, t } = useTranslation();
  const columns: AdminColumn<AdminPost>[] = [
    { key: "content", labelKey: "admin.columns.content", className: "max-w-sm", render: (row) => <Link className="font-medium text-foreground hover:text-primary" to={`/post/${row.id}`}>{truncateAdminText(row.content)}</Link> },
    { key: "author", labelKey: "admin.columns.author", render: (row) => `@${row.authorUsername}` },
    { key: "status", labelKey: "admin.columns.status", render: (row) => <AdminStatus value={row.status} /> },
    { key: "visibility", labelKey: "admin.columns.visibility", render: (row) => row.visibility },
    { key: "engagement", labelKey: "admin.columns.engagement", render: (row) => `${row.likeCount} / ${row.commentCount}` },
    { key: "createdAt", labelKey: "admin.columns.createdAt", render: (row) => formatAdminDate(row.createdAt, i18n.language) },
  ];
  return <AdminListPage section="content" queryKey="posts" fetchPage={fetchAdminPosts} columns={columns} filters={ADMIN_CONTENT_FILTERS} action={<Link to="/admin/content/reports" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-secondary px-4 text-sm font-medium hover:text-primary">{t("admin.viewReports")}</Link>} />;
}
