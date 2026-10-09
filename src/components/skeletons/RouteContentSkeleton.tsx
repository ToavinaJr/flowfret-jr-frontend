import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function RouteContentSkeleton() {
  const { t } = useTranslation();

  return (
    <div
      className="mx-auto w-full max-w-3xl px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8"
      role="status"
      aria-busy="true"
      aria-label={t("skeletons.appLoading")}
    >
      <Skeleton className="mb-5 h-7 w-40 sm:mb-6 sm:h-8" />
      <div className="space-y-4">
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
