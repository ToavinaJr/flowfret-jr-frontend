import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MusicSearchForm } from "@/components/features/music/MusicSearchForm";
import { MusicSearchResults } from "@/components/features/music/MusicSearchResults";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useMusicSearch } from "@/hooks/useMusicSearch";
import { usePlayback } from "@/contexts/usePlayback";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";

const MusicSearchPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sharedQuery = searchParams.get("q")?.trim() ?? "";
  const playback = usePlayback();
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
    if (!hasSearched || !hasMore) {
      playback.setQueueContinuation(null);
      return;
    }
    playback.setQueueContinuation(async () => {
      const nextTracks = await loadMore();
      const known = new Set((results?.tracks ?? []).map((track) => `${track.provider}:${track.providerTrackId}`));
      return nextTracks
        .filter((track) => !known.has(`${track.provider}:${track.providerTrackId}`))
        .map(toMusicPlaybackItem);
    });
    return () => playback.setQueueContinuation(null);
  }, [hasSearched, hasMore, loadMore, playback.setQueueContinuation, results]);

  useEffect(() => {
    if (sharedQuery) search(sharedQuery);
  }, [search, sharedQuery]);

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("music.title")}</h1>

      <div className="space-y-6">
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
