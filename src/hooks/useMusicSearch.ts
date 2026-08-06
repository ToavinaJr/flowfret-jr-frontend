import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { searchMusic } from "@/services/musicGraphql";
import type { MusicSearchResult } from "@/types/music";
import { ApiClientError } from "@/types/api";

const DEFAULT_LIMIT = 10;

interface UseMusicSearchResult {
  query: string;
  results: MusicSearchResult | null;
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (nextQuery: string, limit?: number) => void;
  reset: () => void;
}

export function useMusicSearch(): UseMusicSearchResult {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [hasSearched, setHasSearched] = useState(false);

  const musicQuery = useQuery({
    queryKey: ["music-search", submittedQuery, limit],
    queryFn: () => searchMusic(submittedQuery, limit),
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

  const errorMessage =
    musicQuery.error instanceof ApiClientError
      ? musicQuery.error.message
      : musicQuery.error instanceof Error
        ? musicQuery.error.message
        : musicQuery.error
          ? "An error occurred"
          : null;

  return {
    query,
    results: musicQuery.data ?? null,
    loading: musicQuery.isFetching,
    error: errorMessage,
    hasSearched,
    search,
    reset,
  };
}
