import { Skeleton } from "@/components/ui/skeleton";

export function MusicSearchSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          key={index}
          className="flex min-h-[160px] flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 sm:min-h-[112px] sm:flex-nowrap sm:gap-4 sm:p-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:contents">
            <Skeleton className="h-[72px] w-[72px] shrink-0 rounded-lg sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-11 shrink-0 rounded-md" />
          </div>
        </li>
      ))}
    </ul>
  );
}
