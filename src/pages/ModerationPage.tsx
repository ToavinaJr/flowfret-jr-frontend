import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { REPORT_STATUS, USER_ROLE } from "@/constants/domain";
import {
  fetchModerationReports,
  setReportStatus,
  type ReportStatus,
} from "@/services/moderationApi";
import { useTranslation } from "react-i18next";

export default function ModerationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const client = useQueryClient();
  const reports = useQuery({
    queryKey: ["moderation-reports"],
    queryFn: fetchModerationReports,
    enabled: user?.role === USER_ROLE.ADMIN,
  });
  const moderate = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Exclude<ReportStatus, typeof REPORT_STATUS.OPEN>;
    }) => setReportStatus(id, status),
    onSuccess: () => {
      toast.success(t("moderation.updated"));
      void client.invalidateQueries({ queryKey: ["moderation-reports"] });
    },
    onError: () => toast.error(t("moderation.failed")),
  });

  if (user?.role !== USER_ROLE.ADMIN) return <Navigate to="/" replace />;

  return (
    <div className={`${PAGE_SHELL} max-w-4xl lg:max-w-4xl`}>
      <h1 className={`${PAGE_TITLE} flex items-center gap-2`}>
        <ShieldCheck className="h-5 w-5" /> {t("moderation.title")}
      </h1>
      {reports.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : null}
      {reports.isError ? (
        <p role="alert" className="text-sm text-destructive">
          {t("moderation.loadFailed")}
        </p>
      ) : null}
      <div className="space-y-3">
        {(reports.data ?? []).map((report) => (
          <article
            key={report.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                {report.status}
              </span>
              <Link
                to={`/post/${report.post.id}`}
                className="inline-flex min-h-10 items-center gap-1 text-sm text-primary hover:underline"
              >
                {t("notifications.viewPost")} <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="mb-2 text-sm font-medium">{report.reason}</p>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {report.post.content || t("moderation.postWithoutText")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("moderation.reportedBy", {
                reporter: report.reporter.username,
                author: report.post.author.username,
              })}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={moderate.isPending}
                onClick={() =>
                  moderate.mutate({
                    id: report.id,
                    status: REPORT_STATUS.REVIEWED,
                  })
                }
                className="min-h-10 rounded-md border border-border px-3 text-sm disabled:opacity-50"
              >
                {t("moderation.review")}
              </button>
              <button
                type="button"
                disabled={moderate.isPending}
                onClick={() =>
                  moderate.mutate({
                    id: report.id,
                    status: REPORT_STATUS.RESOLVED,
                  })
                }
                className="inline-flex min-h-10 items-center gap-1 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t("moderation.resolve")}
              </button>
              <button
                type="button"
                disabled={moderate.isPending}
                onClick={() =>
                  moderate.mutate({
                    id: report.id,
                    status: REPORT_STATUS.DISMISSED,
                  })
                }
                className="inline-flex min-h-10 items-center gap-1 rounded-md bg-secondary px-3 text-sm disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                {t("moderation.dismiss")}
              </button>
            </div>
          </article>
        ))}
      </div>
      {reports.isSuccess && reports.data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("moderation.empty")}
        </p>
      ) : null}
    </div>
  );
}
