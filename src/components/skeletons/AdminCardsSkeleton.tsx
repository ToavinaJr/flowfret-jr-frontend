import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function AdminCardsSkeleton({ count = 4 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.adminLoading")} className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <article key={i} className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/5" /><Skeleton className="h-3 w-3/5" /></div><Skeleton className="h-9 w-24" /></div><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-10 w-44" /></article>)}
    </div>
  );
}
