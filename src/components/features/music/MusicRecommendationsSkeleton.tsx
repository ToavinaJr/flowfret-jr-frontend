import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

type MusicRecommendationsSkeletonProps = {
  layout?: "rail" | "list";
};

export function MusicRecommendationsSkeleton({ layout = "rail" }: MusicRecommendationsSkeletonProps) {
  const { t } = useTranslation();

  if (layout === "list") {
    return (
      <div role="status" aria-label={t("music.recommendationsLoading")} className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 sm:gap-4 sm:p-4">
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-label={t("music.recommendationsLoading")} className="-mx-1 flex gap-3 overflow-hidden px-1 pb-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="w-28 shrink-0 space-y-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  );
}
