import { Skeleton } from "@/components/ui/skeleton";

export function MusicSearchSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <li
          key={index}
          className="flex gap-3 rounded-lg border border-border bg-card p-3"
        >
          <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}
