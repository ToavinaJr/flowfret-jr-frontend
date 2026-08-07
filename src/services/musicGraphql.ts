import { graphqlRequest } from "@/services/graphqlClient";
import type {
  MusicSearchResult,
  SearchMusicQueryData,
  SearchMusicQueryVariables,
} from "@/types/music";

export const SEARCH_MUSIC_QUERY = `
  query SearchMusic($query: String!, $limit: Int!) {
    searchMusic(query: $query, limit: $limit) {
      total
      tracks {
        youtubeId
        title
        imageUrl
        youtubeUrl
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

const DEFAULT_SEARCH_LIMIT = 10;

export async function searchMusic(
  query: string,
  limit: number = DEFAULT_SEARCH_LIMIT,
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
    } satisfies SearchMusicQueryVariables,
  });

  return data.searchMusic;
}
