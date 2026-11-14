import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { searchMusic } from "@/services/musicGraphql";
import type { MusicSearchResult } from "@/types/music";
import type { MusicTrack } from "@/types/music";
import { ApiClientError } from "@/types/api";
import { fetchListeningHistory } from "@/services/listeningHistoryApi";
import { clearMusicSearchHistory, readMusicSearchHistory, saveMusicSearch } from "@/services/musicSearchHistory";

const DEFAULT_LIMIT = 10;

interface UseMusicSearchResult {
  query: string;
  results: MusicSearchResult | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  hasSearched: boolean;
  displayingHistory: boolean;
  recentSearches: string[];
  search: (nextQuery: string, limit?: number) => void;
  loadMore: () => Promise<MusicTrack[]>;
  reset: () => void;
  clearRecentSearches: () => void;
}

export function useMusicSearch(): UseMusicSearchResult {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState(readMusicSearchHistory);
  const historyQuery = useInfiniteQuery({
    queryKey: ["listening-history"],
    queryFn: ({ pageParam }) => fetchListeningHistory(DEFAULT_LIMIT, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.length === DEFAULT_LIMIT ? allPages.length * DEFAULT_LIMIT : undefined,
    staleTime: 30_000,
  });

  const musicQuery = useInfiniteQuery({
    queryKey: ["music-search", submittedQuery, limit],
    queryFn: ({ pageParam }) =>
      searchMusic(submittedQuery, limit, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: hasSearched && submittedQuery.length > 0,
    staleTime: 60_000,
  });

  const search = useCallback((nextQuery: string, nextLimit = DEFAULT_LIMIT) => {
    const trimmed = nextQuery.trim();
    setQuery(nextQuery);
    if (!trimmed) {
      return;
    }
    setLimit(nextLimit);
    setSubmittedQuery(trimmed);
    setHasSearched(true);
    setRecentSearches(saveMusicSearch(trimmed));
  }, []);

  const clearRecentSearches = useCallback(() => {
    clearMusicSearchHistory();
    setRecentSearches([]);
  }, []);

  const reset = useCallback(() => {
    setQuery("");
    setSubmittedQuery("");
    setHasSearched(false);
  }, []);

  const searchResults = useMemo<MusicSearchResult | null>(() => {
    const pages = musicQuery.data?.pages;
    if (!pages?.length) return null;
    const seen = new Set<string>();
    const tracks = pages
      .flatMap((page) => page.tracks)
      .filter((track) => {
        const key = `${track.provider}:${track.providerTrackId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    const lastPage = pages[pages.length - 1];
    return {
      provider: pages[0].provider,
      tracks,
      total: Math.max(...pages.map((page) => page.total), tracks.length),
      nextCursor: lastPage.nextCursor,
    };
  }, [musicQuery.data?.pages]);

  const historyResults = useMemo<MusicSearchResult | null>(() => {
    const tracks = historyQuery.data?.pages.flat() ?? [];
    if (!tracks.length) return null;
    return {
      provider: tracks[0].provider,
      tracks,
      total: tracks.length,
      nextCursor: null,
    };
  }, [historyQuery.data]);

  const activeError = hasSearched ? musicQuery.error : historyQuery.error;

  const errorMessage =
    activeError instanceof ApiClientError
      ? activeError.message
      : activeError instanceof Error
        ? activeError.message
        : activeError
          ? "An error occurred"
          : null;

  return {
    query,
    results: hasSearched ? searchResults : historyResults,
    loading: hasSearched ? musicQuery.isLoading : historyQuery.isLoading,
    loadingMore: hasSearched ? musicQuery.isFetchingNextPage : historyQuery.isFetchingNextPage,
    hasMore: hasSearched ? Boolean(musicQuery.hasNextPage) : Boolean(historyQuery.hasNextPage),
    error: errorMessage,
    hasSearched,
    displayingHistory: !hasSearched && Boolean(historyResults?.tracks.length),
    recentSearches,
    search,
    loadMore: async () => {
      if (!hasSearched || !musicQuery.hasNextPage || musicQuery.isFetchingNextPage) return [];
      const page = await musicQuery.fetchNextPage();
      const pages = page.data?.pages;
      return pages?.[pages.length - 1]?.tracks ?? [];
    },
    reset,
    clearRecentSearches,
  };
}
