import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileText, Flag, MessageSquare, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdminDashboardStatistics } from "@/services/adminApi";

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const statistics = useQuery({
    queryKey: ["admin", "statistics", 30],
    queryFn: () => fetchAdminDashboardStatistics(30),
    staleTime: 30_000,
  });

  const totals = statistics.data?.totals;
  const cards = [
    { key: "users", value: totals?.users, icon: Users },
    { key: "posts", value: totals?.posts, icon: FileText },
    { key: "comments", value: totals?.comments, icon: MessageSquare },
    { key: "openReports", value: totals?.openReports, icon: Flag },
  ] as const;

  return (
    <section aria-labelledby="admin-overview-title">
      <div className="mb-6 sm:mb-8">
        <h1 id="admin-overview-title" className="text-2xl font-semibold sm:text-3xl">
          {t("admin.overview.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("admin.overview.description")}
        </p>
      </div>

      {statistics.isError ? (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-card p-4 text-sm"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p>{t("admin.overview.loadFailed")}</p>
            <button
              type="button"
              onClick={() => void statistics.refetch()}
              className="mt-3 min-h-11 rounded-lg bg-secondary px-4 font-medium"
            >
              {t("common.retry")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.key}
            className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm text-muted-foreground">
                {t(`admin.metrics.${card.key}`)}
              </p>
              <card.icon className="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {statistics.isLoading ? "—" : (card.value ?? 0).toLocaleString()}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
