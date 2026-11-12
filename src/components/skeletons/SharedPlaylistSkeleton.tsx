import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

export function SharedPlaylistSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("playlists.sharedLoading")} className="mx-auto max-w-4xl">
      <div aria-hidden="true" className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-end sm:p-8">
        <Skeleton className="aspect-square w-36 shrink-0 rounded-xl sm:w-48" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="mt-5 space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <Skeleton className="h-4 w-6 shrink-0" />
            <Skeleton className="h-12 w-12 shrink-0" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
