import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Search, ShieldCheck, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { REPORT_STATUS, USER_ROLE } from "@/constants/domain";
import { fetchAdminPostReports, moderateAdminPostReport } from "@/services/adminApi";
import type { AdminPostReport } from "@/types/admin";
import { ApiClientError } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminStatus } from "@/admin/AdminListPage";
import { formatAdminDate } from "@/admin/adminFormat";

type Decision = {
  report: AdminPostReport;
  status: Exclude<AdminPostReport["status"], typeof REPORT_STATUS.OPEN>;
};

const PAGE_SIZE = 20;
const REPORT_STATUSES = [
  REPORT_STATUS.OPEN,
  REPORT_STATUS.REVIEWED,
  REPORT_STATUS.RESOLVED,
  REPORT_STATUS.DISMISSED,
] as const;

export default function ModerationPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState<string>(REPORT_STATUS.OPEN);
  const [status, setStatus] = useState<string>(REPORT_STATUS.OPEN);
  const [cursors, setCursors] = useState<Array<string | undefined>>([undefined]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [reason, setReason] = useState("");
  const cursor = cursors[cursors.length - 1];

  const reports = useQuery({
    queryKey: ["admin", "reports", search, status, cursor],
    queryFn: () =>
      fetchAdminPostReports({
        first: PAGE_SIZE,
        ...(cursor ? { after: cursor } : {}),
        ...(search ? { search } : {}),
        ...(status ? { reportStatus: status } : {}),
      }),
    enabled: user?.role === USER_ROLE.ADMIN,
    placeholderData: (previous) => previous,
  });

  const moderate = useMutation({
    mutationFn: () => {
      if (!decision) throw new Error("No report decision selected");
      return moderateAdminPostReport({
        reportId: decision.report.id,
        status: decision.status,
        reason: reason.trim(),
      });
    },
    onSuccess: () => {
      toast.success(t("moderation.updated"));
      setDecision(null);
      setReason("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "audit"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "statistics"] });
    },
    onError: (error) => {
      const code =
        error instanceof ApiClientError
          ? error.graphQLErrors[0]?.extensions?.code
          : undefined;
      toast.error(
        code
          ? t(`moderation.errors.${code}`, {
              defaultValue: t("moderation.failed"),
            })
          : t("moderation.failed"),
      );
    },
  });

  if (user?.role !== USER_ROLE.ADMIN) return <Navigate to="/" replace />;

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setStatus(draftStatus);
    setCursors([undefined]);
  }

  function resetFilters() {
    setDraftSearch("");
    setSearch("");
    setDraftStatus("");
    setStatus("");
    setCursors([undefined]);
  }

  function closeDecision() {
    if (moderate.isPending) return;
    setDecision(null);
    setReason("");
  }

  function submitDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision || reason.trim().length < 3) return;
    moderate.mutate();
  }

  return (
    <section aria-labelledby="moderation-title" className="mx-auto w-full max-w-5xl">
      <header className="mb-6">
        <h1 id="moderation-title" className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
          <ShieldCheck aria-hidden="true" className="h-6 w-6 text-primary" />
          {t("moderation.title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("moderation.description")}</p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <form onSubmit={applyFilters} className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t("admin.search")}</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={draftSearch}
              onChange={(event) => setDraftSearch(event.target.value)}
              placeholder={t("moderation.searchPlaceholder")}
              className="min-h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            <span>{t("moderation.statusFilter")}</span>
            <select
              value={draftStatus}
              onChange={(event) => setDraftStatus(event.target.value)}
              className="min-h-11 min-w-44 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
            >
              <option value="">{t("moderation.allStatuses")}</option>
              {REPORT_STATUSES.map((value) => (
                <option key={value} value={value}>{t(`moderation.status.${value}`)}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
              {t("admin.search")}
            </button>
            {(search || status !== "") && (
              <button type="button" onClick={resetFilters} className="min-h-11 rounded-lg px-3 text-sm underline-offset-4 hover:underline">
                {t("admin.filters.reset")}
              </button>
            )}
          </div>
          <p aria-live="polite" className="text-sm tabular-nums text-muted-foreground sm:ml-auto">
            {t("admin.total", { count: reports.data?.totalCount ?? 0 })}
          </p>
        </form>

        {reports.isError ? (
          <div role="alert" className="p-5 text-sm text-destructive">
            <p>{t("moderation.loadFailed")}</p>
            <button type="button" onClick={() => void reports.refetch()} className="mt-3 min-h-11 rounded-lg bg-secondary px-4 text-foreground">
              {t("common.retry")}
            </button>
          </div>
        ) : null}

        {reports.isLoading ? (
          <div className="space-y-3 p-4" aria-label={t("common.loading")}>
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-lg bg-secondary" />)}
          </div>
        ) : null}

        <div className="divide-y divide-border">
          {reports.data?.nodes.map((report) => (
            <article key={report.id} className="space-y-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatus value={report.status} />
                  <span className="text-xs text-muted-foreground">{formatAdminDate(report.createdAt, i18n.language)}</span>
                  {report.reviewedAt ? (
                    <span className="text-xs text-muted-foreground">
                      {t("moderation.reviewedAt", { date: formatAdminDate(report.reviewedAt, i18n.language) })}
                    </span>
                  ) : null}
                </div>
                <Link to={`/post/${report.postId}`} className="inline-flex min-h-10 items-center gap-1 text-sm text-primary hover:underline">
                  {t("notifications.viewPost")} <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{t("moderation.postBy", { author: report.postAuthorUsername })}</span>
                  <span>{t(`admin.values.${report.postStatus}`, { defaultValue: report.postStatus })}</span>
                  <span>{t(`moderation.visibility.${report.postVisibility}`, { defaultValue: report.postVisibility })}</span>
                  {report.postIsDeleted ? <span className="text-destructive">{t("moderation.postDeleted")}</span> : null}
                </div>
                <p className="whitespace-pre-wrap break-words text-sm">
                  {report.postContent || t("moderation.postWithoutText")}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("moderation.reportReason")}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{report.reason}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("moderation.reportedBy", { reporter: report.reporterUsername, author: report.postAuthorUsername })}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {REPORT_STATUSES.filter((next) => next !== REPORT_STATUS.OPEN && next !== report.status).map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={moderate.isPending}
                    onClick={() => {
                      setReason("");
                      setDecision({ report, status: next });
                    }}
                    className={`inline-flex min-h-10 items-center gap-1 rounded-md px-3 text-sm disabled:opacity-50 ${next === REPORT_STATUS.RESOLVED ? "bg-primary text-primary-foreground" : "border border-border"}`}
                  >
                    {next === REPORT_STATUS.RESOLVED ? <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> : null}
                    {next === REPORT_STATUS.DISMISSED ? <XCircle aria-hidden="true" className="h-4 w-4" /> : null}
                    {next === REPORT_STATUS.REVIEWED ? t("moderation.review") : t(`moderation.status.${next}`)}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>

        {reports.isSuccess && reports.data.nodes.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("moderation.empty")}</p>
        ) : null}

        <footer className="flex items-center justify-between gap-3 border-t border-border p-3">
          <span className="text-xs text-muted-foreground">{t("moderation.pageSize", { count: PAGE_SIZE })}</span>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={t("admin.previousPage")}
              disabled={cursors.length === 1 || reports.isFetching}
              onClick={() => setCursors((current) => current.slice(0, -1))}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border disabled:opacity-40"
            ><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
            <button
              type="button"
              aria-label={t("admin.nextPage")}
              disabled={!reports.data?.pageInfo.hasNextPage || !reports.data.pageInfo.endCursor || reports.isFetching}
              onClick={() => {
                const next = reports.data?.pageInfo.endCursor;
                if (next) setCursors((current) => [...current, next]);
              }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border disabled:opacity-40"
            ><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </footer>
      </div>

      <Dialog
        open={decision !== null}
        onOpenChange={(open) => { if (!open) closeDecision(); }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("moderation.decisionTitle", { status: decision ? t(`moderation.status.${decision.status}`) : "" })}</DialogTitle>
            <DialogDescription>{t("moderation.decisionDescription")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitDecision} className="space-y-4">
            <label htmlFor="moderation-decision-reason" className="block text-sm">
              <span className="mb-1 block text-muted-foreground">{t("moderation.decisionReason")}</span>
              <textarea
                id="moderation-decision-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                minLength={3}
                maxLength={500}
                required
                rows={4}
                className="w-full resize-y rounded-lg border border-border bg-background p-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
            <DialogFooter>
              <button type="button" onClick={closeDecision} disabled={moderate.isPending} className="min-h-11 rounded-lg border border-border px-4 text-sm disabled:opacity-50">
                {t("common.cancel")}
              </button>
              <button type="submit" disabled={moderate.isPending || reason.trim().length < 3} className="min-h-11 rounded-lg bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">
                {moderate.isPending ? t("common.loading") : t("moderation.confirmDecision")}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
