import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, ArrowRight, Database, FileText, Flag, Headphones, MessageSquare, Music2, RefreshCw, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { fetchAdminBackendStatus, fetchAdminDashboardStatistics } from "@/services/adminApi";
import type { AdminCategoryStatistic, AdminDailyStatistic } from "@/types/admin";
import { ADMIN_NAV_ITEMS } from "./adminNavigation";

type SeriesKey = "users" | "posts" | "comments" | "reports" | "trackPlays";

function withQuery(path: string, values: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}

export default function AdminOverviewPage() {
  const { t, i18n } = useTranslation();
  const [days, setDays] = useState(30);
  const [series, setSeries] = useState<SeriesKey>("users");
  const statistics = useQuery({
    queryKey: ["admin", "statistics", days],
    queryFn: () => fetchAdminDashboardStatistics(days),
    staleTime: 30_000,
  });
  const backend = useQuery({
    queryKey: ["admin", "backend-status"],
    queryFn: fetchAdminBackendStatus,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const data = statistics.data;
  const unavailable = statistics.isLoading || statistics.isError;
  const number = (value: number | undefined) => unavailable || value === undefined ? "—" : value.toLocaleString(i18n.language);
  const totals = data?.totals;
  const cards = [
    { key: "users", value: totals?.users, icon: Users },
    { key: "activeUsers", value: totals?.activeUsers, icon: Activity },
    { key: "posts", value: totals?.posts, icon: FileText },
    { key: "comments", value: totals?.comments, icon: MessageSquare },
    { key: "openReports", value: totals?.openReports, icon: Flag },
    { key: "uploads", value: totals?.uploads, icon: FileText },
    { key: "transcriptions", value: totals?.transcriptions, icon: Activity },
    { key: "chordTranscriptions", value: totals?.chordTranscriptions, icon: Music2 },
    { key: "playlists", value: totals?.playlists, icon: Music2 },
    { key: "catalogTracks", value: totals?.catalogTracks, icon: Headphones },
    { key: "trackPlays", value: totals?.trackPlays, icon: Headphones },
  ];
  const periodCards = [
    ["newUsers", data?.period.newUsers], ["newPosts", data?.period.newPosts],
    ["newComments", data?.period.newComments], ["newUploads", data?.period.newUploads],
    ["newTranscriptions", data?.period.newTranscriptions], ["reportsCreated", data?.period.reportsCreated],
    ["periodPlays", data?.period.trackPlays],
  ] as const;
  const seriesKeys: SeriesKey[] = ["users", "posts", "comments", "reports", "trackPlays"];
  const dailyMax = Math.max(1, ...(data?.daily ?? []).map((point) => point[series]));
  const periodFrom = data?.periodStart.slice(0, 10);
  const periodTo = data?.periodEnd.slice(0, 10);
  const dailyDestination = (point: AdminDailyStatistic) => {
    const dates = { from: point.date, to: point.date };
    switch (series) {
      case "users": return withQuery("/admin/users", dates);
      case "posts": return withQuery("/admin/content", dates);
      case "comments": return withQuery("/admin/data", { entity: "COMMENT", ...dates });
      case "reports": return withQuery("/admin/content/reports", dates);
      case "trackPlays": return withQuery("/admin/audit", { action: "MUTATION_RECORDTRACKLISTEN", ...dates });
    }
  };
  const metricDestinations: Record<string, string> = {
    users: "/admin/users",
    activeUsers: withQuery("/admin/users", { status: "ACTIVE" }),
    posts: "/admin/content",
    comments: withQuery("/admin/data", { entity: "COMMENT" }),
    openReports: withQuery("/admin/content/reports", { status: "OPEN" }),
    uploads: withQuery("/admin/media", { view: "uploads" }),
    transcriptions: withQuery("/admin/media", { view: "transcriptions" }),
    chordTranscriptions: withQuery("/admin/media", { view: "chords" }),
    playlists: withQuery("/admin/music", { view: "playlists" }),
    catalogTracks: withQuery("/admin/music", { view: "catalog" }),
    trackPlays: withQuery("/admin/music", { view: "history" }),
    newUsers: withQuery("/admin/users", { from: periodFrom, to: periodTo }),
    newPosts: withQuery("/admin/content", { from: periodFrom, to: periodTo }),
    newComments: withQuery("/admin/data", { entity: "COMMENT", from: periodFrom, to: periodTo }),
    newUploads: withQuery("/admin/media", { view: "uploads", from: periodFrom, to: periodTo }),
    newTranscriptions: withQuery("/admin/media", { view: "transcriptions", from: periodFrom, to: periodTo }),
    reportsCreated: withQuery("/admin/content/reports", { from: periodFrom, to: periodTo }),
    periodPlays: withQuery("/admin/audit", { action: "MUTATION_RECORDTRACKLISTEN", from: periodFrom, to: periodTo }),
  };
  const parseDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T00:00:00`
      : value;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };
  const formatDate = (value?: string | null) => {
    const date = parseDate(value);
    return date
      ? new Intl.DateTimeFormat(i18n.language, { month: "short", day: "numeric" }).format(date)
      : "—";
  };
  const formatDateTime = (value?: string | null) => {
    const date = parseDate(value);
    return date ? date.toLocaleString(i18n.language) : "—";
  };

  const distribution = (title: string, entries: AdminCategoryStatistic[] | undefined, loading: boolean, failed: boolean, getDestination: (key: string) => string) => {
    const max = Math.max(1, ...(entries ?? []).map(({ count }) => count));
    return <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="font-semibold">{title}</h3>
      {loading ? <p className="mt-4 text-sm text-muted-foreground">{t("admin.overview.loading")}</p> : failed ? <p className="mt-4 text-sm text-destructive">{t("admin.overview.unavailable")}</p> : entries?.length ? <ul className="mt-4 space-y-3">{entries.map((entry) => <li key={entry.key}>
        <div className="mb-1 flex min-w-0 justify-between gap-3 text-sm"><span className="min-w-0 flex-1 truncate">{t(`admin.values.${entry.key}`, { defaultValue: entry.key })}</span><Link className="shrink-0 rounded-sm font-medium tabular-nums text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" to={getDestination(entry.key)} aria-label={t("admin.overview.openItemsFor", { value: entry.count, label: t(`admin.values.${entry.key}`, { defaultValue: entry.key }) })}>{entry.count.toLocaleString(i18n.language)}</Link></div>
        <div className="h-2 max-w-full overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(1, entry.count / max * 100)}%` }} /></div>
      </li>)}</ul> : <p className="mt-4 text-sm text-muted-foreground">{t("admin.overview.noDistribution")}</p>}
    </section>;
  };

  return <section aria-labelledby="admin-overview-title" className="min-w-0">
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 id="admin-overview-title" className="text-2xl font-semibold sm:text-3xl">{t("admin.overview.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{t("admin.overview.description")}</p>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">{t("admin.overview.period")}
        <select className="min-h-11 rounded-lg border border-border bg-card px-3" value={days} onChange={(event) => setDays(Number(event.target.value))}>
          {[7, 30, 90, 365].map((value) => <option key={value} value={value}>{t("admin.overview.days", { count: value })}</option>)}
        </select>
      </label>
    </div>

    {statistics.isError && <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-destructive/30 bg-card p-4 text-sm">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /><div className="flex-1"><p>{t("admin.overview.loadFailed")}</p>
        <button type="button" onClick={() => void statistics.refetch()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-secondary px-4 font-medium"><RefreshCw className="h-4 w-4" />{t("common.retry")}</button></div>
    </div>}

    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <Database className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t("admin.overview.database")}</span>
      {backend.isLoading ? <span className="text-muted-foreground">{t("admin.overview.checking")}</span> : backend.isError || !backend.data ? <span className="text-muted-foreground">{t("admin.overview.statusUnknown")}</span> : backend.data.databaseReachable ? <span className="text-emerald-600">{t("admin.overview.reachable")}</span> : <span className="text-destructive">{t("admin.overview.unreachable")}</span>}
      <span className="ml-auto text-xs text-muted-foreground">{backend.data?.serverTime ? t("admin.overview.serverTime", { time: formatDateTime(backend.data.serverTime) }) : ""}</span>
      {backend.isError && <button type="button" className="min-h-11 rounded-lg px-2 font-medium underline" onClick={() => void backend.refetch()}>{t("common.retry")}</button>}
    </div>

    <h2 className="mb-3 text-lg font-semibold">{t("admin.overview.totalActivity")}</h2>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <article key={card.key} className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3"><p className="truncate text-sm text-muted-foreground">{t(`admin.metrics.${card.key}`)}</p><card.icon className="h-4 w-4 shrink-0 text-primary" /></div>
      {card.value !== undefined && !unavailable ? <Link to={metricDestinations[card.key]} className="mt-3 inline-flex rounded-sm text-2xl font-semibold tabular-nums text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("admin.overview.openItemsFor", { value: number(card.value), label: t(`admin.metrics.${card.key}`) })}>{number(card.value)}</Link> : <p className="mt-3 text-2xl font-semibold tabular-nums">{number(card.value)}</p>}
    </article>)}</div>

    <section className="mt-8 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-semibold">{t("admin.overview.periodActivity")}</h2><p className="mt-1 text-sm text-muted-foreground">{data ? `${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}` : ""}</p></div>
        {data?.generatedAt && <p className="text-xs text-muted-foreground">{t("admin.overview.generatedAt", { time: formatDateTime(data.generatedAt) })}</p>}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{periodCards.map(([key, value]) => <div key={key} className="rounded-lg bg-secondary/50 p-3"><p className="text-sm text-muted-foreground">{t(`admin.metrics.${key}`)}</p><Link to={metricDestinations[key]} className="mt-1 inline-flex rounded-sm text-xl font-semibold tabular-nums text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t("admin.overview.openItemsFor", { value: number(value), label: t(`admin.metrics.${key}`) })}>{number(value)}</Link></div>)}</div>
    </section>

    <div className="mt-8 grid min-w-0 gap-4 xl:grid-cols-3">
      <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4 xl:col-span-2 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{t("admin.overview.trendTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("admin.overview.trendDescription", { count: days })}</p></div>
          <label className="sr-only" htmlFor="admin-trend-series">{t("admin.overview.series")}</label><select id="admin-trend-series" className="min-h-11 rounded-lg border border-border bg-card px-3 text-sm" value={series} onChange={(event) => setSeries(event.target.value as SeriesKey)}>{seriesKeys.map((key) => <option key={key} value={key}>{t(`admin.overview.seriesNames.${key}`)}</option>)}</select></div>
        {statistics.isLoading ? <p className="mt-6 text-sm text-muted-foreground">{t("admin.overview.loading")}</p> : statistics.isError ? <p className="mt-6 text-sm text-destructive">{t("admin.overview.unavailable")}</p> : data?.daily.length ? <div className="mt-6 min-w-0 pb-2">
          <div className="grid h-48 w-full min-w-0 items-end gap-1 border-b border-border px-1" style={{ gridTemplateColumns: `repeat(${data.daily.length}, minmax(0, 1fr))` }} aria-label={t("admin.overview.trendTitle")}>
            {data.daily.map((point: AdminDailyStatistic) => { const value = point[series]; return <Link key={point.date} to={dailyDestination(point)} className="flex h-full min-w-0 flex-col justify-end rounded-t text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" title={`${formatDate(point.date)}: ${value.toLocaleString(i18n.language)} — ${t("admin.overview.showItems")}`} aria-label={t("admin.overview.openDailyItems", { date: formatDate(point.date), value: value.toLocaleString(i18n.language), series: t(`admin.overview.seriesNames.${series}`) })}><span className="truncate text-[10px] leading-3 text-primary">{value.toLocaleString(i18n.language)}</span><div className="flex min-h-0 flex-1 items-end"><div className="mx-auto w-full max-w-4 rounded-t bg-primary" style={{ height: `${value ? Math.max(3, value / dailyMax * 82) : 0}%` }} /></div></Link>; })}
          </div><div className="mt-2 flex w-full min-w-0 justify-between text-xs text-muted-foreground"><span>{data.daily[0] ? formatDate(data.daily[0].date) : ""}</span><span>{data.daily[data.daily.length - 1] ? formatDate(data.daily[data.daily.length - 1].date) : ""}</span></div>
        </div> : <p className="mt-6 text-sm text-muted-foreground">{t("admin.overview.noTrend")}</p>}
      </section>
      {distribution(t("admin.overview.usersByStatus"), data?.usersByStatus, statistics.isLoading, statistics.isError, (key) => withQuery("/admin/users", { status: key }))}
      {distribution(t("admin.overview.transcriptionsByStatus"), data?.transcriptionsByStatus, statistics.isLoading, statistics.isError, (key) => withQuery("/admin/media", { view: "transcriptions", transcriptionStatus: key }))}
      {distribution(t("admin.overview.playsByProvider"), data?.playsByProvider, statistics.isLoading, statistics.isError, (key) => withQuery("/admin/music", { view: "history", provider: key }))}
    </div>

    <div className="mt-8"><h2 className="text-lg font-semibold">{t("admin.overview.sectionsTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("admin.overview.sectionsDescription")}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{ADMIN_NAV_ITEMS.slice(1).map((item) => <li key={item.path}><Link to={item.path} className="group flex min-h-20 min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <item.icon className="h-5 w-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 truncate font-medium">{t(item.translationKey)}</span><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </Link></li>)}</ul>
    </div>
  </section>;
}
