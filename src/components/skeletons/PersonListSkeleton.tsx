import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function PersonListSkeleton({ count = 3 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label={t("skeletons.peopleLoading")}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border bg-card p-4"
        >
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36 max-w-full" />
            <Skeleton className="h-3 w-24 max-w-full" />
          </div>
          <Skeleton className="h-10 w-20 shrink-0" />
        </div>
      ))}
    </div>
  );
}
