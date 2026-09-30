import { graphqlRequest } from "@/services/graphqlClient";
import type {
  MusicSearchResult,
  MusicTrack,
  SearchMusicQueryData,
  SearchMusicQueryVariables,
} from "@/types/music";

export const SEARCH_MUSIC_QUERY = `
  query SearchMusic($query: String!, $limit: Int!, $cursor: String) {
    searchMusic(query: $query, limit: $limit, cursor: $cursor) {
      provider
      total
      nextCursor
      tracks {
        provider
        id
        providerTrackId
        audiusId
        title
        imageUrl
        audiusUrl
        externalUrl
        album
        isrc
        streamUrl
        genre
        geniusUrl
        geniusMatchScore
        durationMs
        artists {
          id
          name
        }
      }
    }
  }
`;

export const TRENDING_MUSIC_QUERY = `
  query TrendingMusic {
    trendingMusic {
      provider
      id
      providerTrackId
      audiusId
      title
      imageUrl
      audiusUrl
      externalUrl
      album
      isrc
      streamUrl
      genre
      geniusUrl
      geniusMatchScore
      durationMs
      artists { id name }
    }
  }
`;

const DEFAULT_SEARCH_LIMIT = 10;

export async function searchMusic(
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
  cursor?: string,
): Promise<MusicSearchResult> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new Error("Search query cannot be empty");
  }

  const data = await graphqlRequest<SearchMusicQueryData>({
    query: SEARCH_MUSIC_QUERY,
    variables: {
      query: trimmedQuery,
      limit,
      ...(cursor ? { cursor } : {}),
    } satisfies SearchMusicQueryVariables,
  });

  return data.searchMusic;
}

export async function fetchTrendingMusic(): Promise<MusicTrack[]> {
  const data = await graphqlRequest<{ trendingMusic: MusicTrack[] }>({
    query: TRENDING_MUSIC_QUERY,
  });
  return data.trendingMusic;
}
