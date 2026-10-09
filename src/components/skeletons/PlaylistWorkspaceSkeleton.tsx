import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function PlaylistWorkspaceSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.playlistsLoading")} className="grid gap-4 md:grid-cols-[16rem_minmax(0,1fr)]">
      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </section>
      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-7 w-2/5" />
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex items-center gap-3"><Skeleton className="h-12 w-12 rounded-md" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/5" /><Skeleton className="h-3 w-2/5" /></div></div>)}
      </section>
    </div>
  );
}
