import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, Link } from "react-router-dom";
import { CheckCircle2, ExternalLink, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import {
  fetchModerationReports,
  setReportStatus,
  type ReportStatus,
} from "@/services/moderationApi";

export default function ModerationPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const reports = useQuery({
    queryKey: ["moderation-reports"],
    queryFn: fetchModerationReports,
    enabled: user?.role === "ADMIN",
  });
  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Exclude<ReportStatus, "OPEN"> }) =>
      setReportStatus(id, status),
    onSuccess: () => {
      toast.success("Signalement mis à jour.");
      void client.invalidateQueries({ queryKey: ["moderation-reports"] });
    },
    onError: () => toast.error("La modération a échoué."),
  });

  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <main className={`${PAGE_SHELL} max-w-4xl lg:max-w-4xl`}>
      <h1 className={`${PAGE_TITLE} flex items-center gap-2`}>
        <ShieldCheck className="h-5 w-5" /> Modération
      </h1>
      {reports.isLoading ? <p className="text-sm text-muted-foreground">Chargement…</p> : null}
      {reports.isError ? <p role="alert" className="text-sm text-destructive">Impossible de charger les signalements.</p> : null}
      <div className="space-y-3">
        {(reports.data ?? []).map((report) => (
          <article key={report.id} className="rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">{report.status}</span>
              <Link to={`/post/${report.post.id}`} className="inline-flex min-h-10 items-center gap-1 text-sm text-primary hover:underline">
                Voir la publication <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="mb-2 text-sm font-medium">{report.reason}</p>
            <p className="line-clamp-3 text-sm text-muted-foreground">
              {report.post.content || "Publication sans texte"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Signalé par @{report.reporter.username} · auteur @{report.post.author.username}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={moderate.isPending} onClick={() => moderate.mutate({ id: report.id, status: "REVIEWED" })} className="min-h-10 rounded-md border border-border px-3 text-sm disabled:opacity-50">Examiner</button>
              <button disabled={moderate.isPending} onClick={() => moderate.mutate({ id: report.id, status: "RESOLVED" })} className="inline-flex min-h-10 items-center gap-1 rounded-md bg-primary px-3 text-sm text-primary-foreground disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Résoudre</button>
              <button disabled={moderate.isPending} onClick={() => moderate.mutate({ id: report.id, status: "DISMISSED" })} className="inline-flex min-h-10 items-center gap-1 rounded-md bg-secondary px-3 text-sm disabled:opacity-50"><XCircle className="h-4 w-4" />Rejeter</button>
            </div>
          </article>
        ))}
      </div>
      {reports.isSuccess && reports.data.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">Aucun signalement.</p> : null}
    </main>
  );
}
