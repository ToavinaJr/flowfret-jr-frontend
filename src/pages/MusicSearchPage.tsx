import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Music2, Tags, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MusicSearchForm } from "@/components/features/music/MusicSearchForm";
import { MusicSearchResults } from "@/components/features/music/MusicSearchResults";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useMusicSearch } from "@/hooks/useMusicSearch";
import { fetchListeningHistory } from "@/services/listeningHistoryApi";

const HISTORY_SUMMARY_LIMIT = 50;

const MusicSearchPage = () => {
  const { t } = useTranslation();
  const historySummary = useQuery({
    queryKey: ["listening-history-summary"],
    queryFn: () => fetchListeningHistory(HISTORY_SUMMARY_LIMIT),
    staleTime: 30_000,
  });
  const summary = useMemo(() => {
    const tracks = historySummary.data ?? [];
    const artists = new Set(tracks.flatMap((track) => track.artists.map((artist) => artist.name.trim()).filter(Boolean)));
    const genres = new Set(tracks.map((track) => track.genre?.trim()).filter((genre): genre is string => Boolean(genre)));
    return { tracks: tracks.length, artists: artists.size, genres: genres.size };
  }, [historySummary.data]);
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

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("music.title")}</h1>

      <div className="space-y-6">
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
        <MusicSearchForm loading={loading} onSearch={search} recentSearches={recentSearches} onClearRecentSearches={clearRecentSearches} />
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
