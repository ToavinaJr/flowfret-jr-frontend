import { Skeleton } from "@/components/ui/skeleton";

export function TextLinesSkeleton({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-4 px-4 py-5">
      <div aria-hidden="true" className="space-y-4">
        {["w-4/5", "w-3/5", "w-full", "w-2/3", "w-4/5", "w-1/2"].map((width, index) => (
          <Skeleton key={index} className={`h-4 ${width}`} />
        ))}
      </div>
    </div>
  );
}
