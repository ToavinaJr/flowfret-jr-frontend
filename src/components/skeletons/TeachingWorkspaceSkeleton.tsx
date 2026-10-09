import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function TeachingWorkspaceSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.teachingLoading")} className="space-y-8">
      {Array.from({ length: 4 }).map((_, i) => <section key={i} className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"><Skeleton className="h-6 w-2/5" /><div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: i === 2 ? 4 : 6 }).map((__, j) => <Skeleton key={j} className={`h-11 w-full ${j === 5 ? "sm:col-span-2" : ""}`} />)}</div></section>)}
    </div>
  );
}
