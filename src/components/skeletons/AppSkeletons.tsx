import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function AppShellSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-screen bg-background"
      role="status"
      aria-label={t("skeletons.appLoading")}
    >
      <aside className="hidden w-64 shrink-0 border-r border-border p-5 md:block lg:w-72">
        <div className="mb-10 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className={`h-4 ${i % 3 === 0 ? "w-24" : "w-20"}`} />
            </div>
          ))}
        </div>
      </aside>
      <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-11 w-11 rounded-lg" />
        </div>
        <FeedSkeleton count={3} />
      </main>
    </div>
  );
}

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
            <Skeleton className="h-48 w-full rounded-lg" />
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

export function ProfileSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.profileLoading")}>
      <div className="mb-6 flex justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <section className="mb-6 rounded-xl border bg-card p-5">
        <div className="mb-5 flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-32" />
        </div>
      </section>
      <Skeleton className="mb-3 h-6 w-28" />
      <FeedSkeleton count={2} />
    </div>
  );
}

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
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}

export function NotificationsSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.notificationsLoading")}>
      <section className="mb-7 rounded-xl border bg-card p-4">
        <Skeleton className="mb-5 h-5 w-52" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-4 flex justify-between">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </section>
      <Skeleton className="mb-3 h-5 w-32" />
      <PersonListSkeleton count={4} />
    </div>
  );
}

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

export function CommentsSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-3 py-2"
      role="status"
      aria-label={t("skeletons.commentsLoading")}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

export function TranscriptionsWorkspaceSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.transcriptionsLoading")} className="grid min-w-0 gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-2 rounded-xl border border-border bg-card p-3">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="space-y-2 rounded-md p-3"><Skeleton className="h-4 w-4/5" /><Skeleton className="h-3 w-2/5" /></div>)}
      </aside>
      <section className="space-y-4 rounded-xl border border-border bg-card p-4"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-2 w-full rounded-full" />{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</section>
    </div>
  );
}

export function TeachingWorkspaceSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.teachingLoading")} className="space-y-8">
      {Array.from({ length: 4 }).map((_, i) => <section key={i} className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"><Skeleton className="h-6 w-2/5" /><div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: i === 2 ? 4 : 6 }).map((__, j) => <Skeleton key={j} className={`h-11 w-full ${j === 5 ? "sm:col-span-2" : ""}`} />)}</div></section>)}
    </div>
  );
}

export function AdminCardsSkeleton({ count = 4 }: { count?: number }) {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.adminLoading")} className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <article key={i} className="space-y-3 rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/5" /><Skeleton className="h-3 w-3/5" /></div><Skeleton className="h-9 w-24" /></div><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-10 w-44" /></article>)}
    </div>
  );
}
