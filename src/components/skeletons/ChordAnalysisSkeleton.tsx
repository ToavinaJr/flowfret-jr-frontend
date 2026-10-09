import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function ChordAnalysisSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="grid min-h-[430px] overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(0,1fr)_19rem]"
      role="status"
      aria-label={t("skeletons.chordAnalysisLoading")}
    >
      <div className="flex items-center justify-center gap-5 p-8">
        <Skeleton className="hidden h-52 w-28 opacity-30 sm:block" />
        <Skeleton className="h-72 w-48 rounded-xl" />
        <Skeleton className="hidden h-52 w-28 opacity-30 sm:block" />
      </div>
      <aside className="border-t p-3 lg:border-l lg:border-t-0">
        <Skeleton className="mb-4 h-4 w-32" />
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </aside>
    </div>
  );
}
