import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function TranscriptionsWorkspaceSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.transcriptionsLoading")} className="grid min-w-0 gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-2 rounded-xl border border-border bg-card p-3">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="space-y-2 rounded-md p-3"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-2/5" /></div>)}
      </aside>
      <section className="space-y-4 rounded-xl border border-border bg-card p-4"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-2 w-full rounded-full" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</section>
    </div>
  );
}
