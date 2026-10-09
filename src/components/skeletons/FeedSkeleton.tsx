import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-4"
      role="status"
      aria-label={t("skeletons.postsLoading")}
    >
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-4 h-4 w-3/4" />
          {i !== count - 1 ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : null}
          <div className="mt-4 flex gap-5">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
        </article>
      ))}
    </div>
  );
}
