import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Music2, Tags, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MusicSearchForm } from "@/components/features/music/MusicSearchForm";
import { MusicSearchResults } from "@/components/features/music/MusicSearchResults";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useMusicSearch } from "@/hooks/useMusicSearch";
import { fetchListeningHistory, fetchMyListeningStats } from "@/services/listeningHistoryApi";

const HISTORY_SUMMARY_LIMIT = 50;

const MusicSearchPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const sharedQuery = searchParams.get("q")?.trim() ?? "";
  const historySummary = useQuery({
    queryKey: ["listening-history-summary"],
    queryFn: () => fetchListeningHistory(HISTORY_SUMMARY_LIMIT),
    staleTime: 30_000,
  });
  const listeningStats = useQuery({
    queryKey: ["listening-stats"],
    queryFn: fetchMyListeningStats,
    staleTime: 30_000,
  });
  const summary = useMemo(() => {
    const tracks = historySummary.data ?? [];
    const artists = new Set(tracks.flatMap((track) => track.artists.map((artist) => artist.name.trim()).filter(Boolean)));
    const genres = new Set(tracks.map((track) => track.genre?.trim()).filter((genre): genre is string => Boolean(genre)));
    return { tracks: tracks.length, artists: artists.size, genres: genres.size };
  }, [historySummary.data]);
  const dailyPeak = Math.max(1, ...(listeningStats.data?.daily.map((day) => day.listens) ?? []));
  const {
    results,
    loading,
    loadingMore,
    hasMore,
    error,
    hasSearched,
    displayingHistory,
    recentSearches,
    search,
    loadMore,
    clearRecentSearches,
  } = useMusicSearch();

  useEffect(() => {
    if (sharedQuery) search(sharedQuery);
  }, [search, sharedQuery]);

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("music.title")}</h1>

      <div className="space-y-6">
        <section aria-labelledby="listening-stats-title" className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <header className="mb-4">
            <h2 id="listening-stats-title" className="font-semibold">{t("music.listeningStatsTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("music.listeningStatsScope")}</p>
          </header>
          {listeningStats.isLoading ? (
            <p role="status" className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : listeningStats.isError ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p role="alert" className="text-sm text-muted-foreground">{t("music.listeningStatsError")}</p>
              <button type="button" onClick={() => void listeningStats.refetch()} className="min-h-10 rounded-md border border-border px-3 text-sm hover:bg-secondary">{t("common.retry")}</button>
            </div>
          ) : listeningStats.data ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-secondary/60 p-3"><p className="text-lg font-semibold">{listeningStats.data.totalPlays}</p><p className="text-xs text-muted-foreground">{t("music.listeningStatsTotal")}</p></div>
                <div className="rounded-lg bg-secondary/60 p-3"><p className="text-lg font-semibold">{listeningStats.data.repeatedTracks}</p><p className="text-xs text-muted-foreground">{t("music.listeningStatsRepeatedTracks")}</p></div>
                <div className="rounded-lg bg-secondary/60 p-3"><p className="text-lg font-semibold">{listeningStats.data.repeatPlays}</p><p className="text-xs text-muted-foreground">{t("music.listeningStatsRepeatPlays")}</p></div>
              </div>
              <ul aria-label={t("music.listeningStatsDailyLabel")} className="mt-5 grid grid-cols-10 gap-x-1.5 gap-y-3 sm:grid-cols-[repeat(15,minmax(0,1fr))]">
                {listeningStats.data.daily.map((day) => {
                  const date = new Date(`${day.date}T00:00:00Z`);
                  const label = date.toLocaleDateString(i18n.language, { day: "numeric", month: "short", timeZone: "UTC" });
                  const height = day.listens ? Math.max(8, Math.round((day.listens / dailyPeak) * 100)) : 2;
                  const count = t("music.listeningStatsDailyCount", { count: day.listens });
                  return (
                    <li key={day.date} title={`${label}: ${count}`} aria-label={`${label}: ${count}`} className="flex min-w-0 flex-col items-center gap-1">
                      <span className="flex h-16 w-full max-w-5 items-end overflow-hidden rounded-sm bg-secondary" aria-hidden="true"><span className="block w-full rounded-sm bg-primary" style={{ height: `${height}%` }} /></span>
                      <span className="truncate text-[9px] text-muted-foreground">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </section>
        {!hasSearched && historySummary.data?.length ? (
          <section aria-labelledby="listening-history-summary-title" className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4">
              <h2 id="listening-history-summary-title" className="font-semibold">{t("music.historyStatsTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("music.historyStatsScope", { count: HISTORY_SUMMARY_LIMIT })}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
                <Music2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div><p className="text-lg font-semibold">{summary.tracks}</p><p className="text-xs text-muted-foreground">{t("music.historyStatsTracks")}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
                <Users className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div><p className="text-lg font-semibold">{summary.artists}</p><p className="text-xs text-muted-foreground">{t("music.historyStatsArtists")}</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
                <Tags className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div><p className="text-lg font-semibold">{summary.genres}</p><p className="text-xs text-muted-foreground">{t("music.historyStatsGenres")}</p></div>
              </div>
            </div>
          </section>
        ) : null}
        <MusicSearchForm initialQuery={sharedQuery} loading={loading} onSearch={search} recentSearches={recentSearches} onClearRecentSearches={clearRecentSearches} />
        <MusicSearchResults
          loading={loading}
          error={error}
          hasSearched={hasSearched}
          displayingHistory={displayingHistory}
          results={results}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
};

export default MusicSearchPage;
