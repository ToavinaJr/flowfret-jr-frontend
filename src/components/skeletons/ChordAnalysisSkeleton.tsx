import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function ChordAnalysisSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="grid min-h-[430px] overflow-hidden rounded-xl border bg-card lg:grid-cols-[minmax(0,1fr)_19rem]"
      role="status"
      aria-live="polite"
      aria-label={t("skeletons.chordAnalysisLoading")}
    >
      <div className="grid min-h-[250px] grid-cols-2 items-center gap-2 px-2 py-5 sm:min-h-[300px] sm:grid-cols-5 sm:px-4">
        {[0.28, 0.55, 1, 0.55, 0.28].map((opacity, index) => (
          <Skeleton
            key={index}
            className={`mx-auto w-full max-w-28 rounded-xl ${(index === 0 || index === 1 || index === 4) ? "hidden sm:block" : ""} ${index === 2 ? "h-48 sm:h-60" : index % 2 === 1 ? "h-40 sm:h-52" : "h-32 sm:h-44"}`}
            style={{ opacity }}
          />
        ))}
      </div>
      <aside className="border-t border-border bg-background/45 p-3 lg:border-l lg:border-t-0">
        <div className="rounded-lg border border-border/80 bg-card/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-3 pt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </aside>
      <section className="border-t border-border bg-background/25 p-3 sm:p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </section>
    </div>
  );
}
