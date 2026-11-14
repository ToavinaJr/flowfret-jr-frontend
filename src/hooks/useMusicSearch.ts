import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  loadMoreFailed: boolean;
  hasMore: boolean;
  error: string | null;
  hasSearched: boolean;
  displayingHistory: boolean;
  queueSourceKey?: string;
  recentSearches: string[];
  search: (nextQuery: string, limit?: number) => void;
  loadMore: () => Promise<MusicTrack[]>;
  reset: () => void;
  clearRecentSearches: () => void;
}

export function useMusicSearch(): UseMusicSearchResult {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState(readMusicSearchHistory);
  const [loadingMoreKey, setLoadingMoreKey] = useState<string | null>(null);
  const [loadMoreFailedKey, setLoadMoreFailedKey] = useState<string | null>(null);
  const pageRequestsRef = useRef(new Map<string, Promise<MusicTrack[]>>());
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const historyQuery = useInfiniteQuery({
    queryKey: ["listening-history"],
    queryFn: ({ pageParam }) => fetchListeningHistory(DEFAULT_LIMIT, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => lastPage.length === DEFAULT_LIMIT ? allPages.length * DEFAULT_LIMIT : undefined,
    staleTime: 30_000,
  });
  const historyHasNextPage = historyQuery.hasNextPage;
  const historyIsFetchingNextPage = historyQuery.isFetchingNextPage;
  const fetchNextHistoryPage = historyQuery.fetchNextPage;

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
    setLoadMoreFailedKey(null);
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

  const loadMore = useCallback(async (): Promise<MusicTrack[]> => {
    if (!hasSearched) {
      if (!historyHasNextPage || historyIsFetchingNextPage) return [];
      const page = await fetchNextHistoryPage();
      return page.data?.pages.at(-1) ?? [];
    }

    if (!submittedQuery) return [];
    const queryKey = ["music-search", submittedQuery, limit] as const;
    const queryKeyId = JSON.stringify(queryKey);
    const currentData = queryClient.getQueryData<
      InfiniteData<MusicSearchResult, string | undefined>
    >(queryKey);
    const cursor = currentData?.pages.at(-1)?.nextCursor;
    if (!currentData || !cursor) return [];

    const requestKey = `${queryKeyId}:${cursor}`;
    const existingRequest = pageRequestsRef.current.get(requestKey);
    if (existingRequest) return existingRequest;

    if (mountedRef.current) setLoadMoreFailedKey(null);
    if (mountedRef.current) setLoadingMoreKey(queryKeyId);
    const request = (async () => {
      try {
        const nextPage = await searchMusic(submittedQuery, limit, cursor);
        const seen = new Set(
          currentData.pages.flatMap((page) =>
            page.tracks.map((track) => `${track.provider}:${track.providerTrackId}`),
          ),
        );
        const newTracks = nextPage.tracks.filter((track) => {
          const key = `${track.provider}:${track.providerTrackId}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        queryClient.setQueryData<
          InfiniteData<MusicSearchResult, string | undefined>
        >(queryKey, (latestData) => {
          if (!latestData || latestData.pages.at(-1)?.nextCursor !== cursor) {
            return latestData;
          }
          return {
            ...latestData,
            pages: [
              ...latestData.pages,
              {
                ...nextPage,
                nextCursor: nextPage.nextCursor === cursor ? null : nextPage.nextCursor,
              },
            ],
            pageParams: [...latestData.pageParams, cursor],
          };
        });
        return newTracks;
      } catch {
        if (mountedRef.current) setLoadMoreFailedKey(queryKeyId);
        return [];
      } finally {
        pageRequestsRef.current.delete(requestKey);
        if (mountedRef.current) {
          setLoadingMoreKey((activeKey) => activeKey === queryKeyId ? null : activeKey);
        }
      }
    })();
    pageRequestsRef.current.set(requestKey, request);
    return request;
  }, [fetchNextHistoryPage, hasSearched, historyHasNextPage, historyIsFetchingNextPage, limit, queryClient, submittedQuery]);

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
    loadingMore: hasSearched
      ? loadingMoreKey === JSON.stringify(["music-search", submittedQuery, limit])
      : historyQuery.isFetchingNextPage,
    loadMoreFailed: hasSearched
      && loadMoreFailedKey === JSON.stringify(["music-search", submittedQuery, limit]),
    hasMore: hasSearched ? Boolean(musicQuery.hasNextPage) : Boolean(historyQuery.hasNextPage),
    error: errorMessage,
    hasSearched,
    displayingHistory: !hasSearched && Boolean(historyResults?.tracks.length),
    queueSourceKey: hasSearched && searchResults
      ? `music-search:${searchResults.provider}:${submittedQuery.toLowerCase()}:${limit}`
      : undefined,
    recentSearches,
    search,
    loadMore,
    reset,
    clearRecentSearches,
  };
}
