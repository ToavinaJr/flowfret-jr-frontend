import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { searchMusic } from "@/services/musicGraphql";
import type { MusicSearchResult } from "@/types/music";
import { ApiClientError } from "@/types/api";
import { fetchListeningHistory } from "@/services/listeningHistoryApi";

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
  search: (nextQuery: string, limit?: number) => void;
  loadMore: () => void;
  reset: () => void;
}

export function useMusicSearch(): UseMusicSearchResult {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [hasSearched, setHasSearched] = useState(false);
  const historyQuery = useQuery({
    queryKey: ["listening-history"],
    queryFn: fetchListeningHistory,
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
    const tracks = historyQuery.data ?? [];
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
    loadingMore: musicQuery.isFetchingNextPage,
    hasMore: Boolean(musicQuery.hasNextPage),
    error: errorMessage,
    hasSearched,
    displayingHistory: !hasSearched && Boolean(historyResults?.tracks.length),
    search,
    loadMore: () => void musicQuery.fetchNextPage(),
    reset,
  };
}
