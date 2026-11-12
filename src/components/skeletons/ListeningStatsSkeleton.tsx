import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

export function ListeningStatsSkeleton({ showChart = true }: { showChart?: boolean }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("common.loading")}>
      <div aria-hidden="true" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2 rounded-lg bg-secondary/60 p-3">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
      {showChart && (
        <div aria-hidden="true" className="mt-5 grid grid-cols-10 gap-x-1.5 gap-y-3 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
          {Array.from({ length: 30 }).map((_, index) => (
            <div key={index} className="flex min-w-0 flex-col items-center gap-1">
              <Skeleton className="h-16 w-full max-w-5 rounded-sm" />
              <Skeleton className="h-3 w-full max-w-6" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
