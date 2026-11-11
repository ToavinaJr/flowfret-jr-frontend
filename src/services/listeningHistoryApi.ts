import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { MusicTrack } from "@/types/music";
import { graphqlRequest } from "@/services/graphqlClient";
import { getAccessToken } from "@/services/authToken";

const TRACK_FIELDS = `
  provider id providerTrackId audiusId title imageUrl audiusUrl externalUrl
  album isrc streamUrl genre geniusUrl geniusMatchScore durationMs
  artists { id name }
`;

export async function fetchListeningHistory(take = 20, skip = 0): Promise<MusicTrack[]> {
  const data = await graphqlRequest<{ myListeningHistory: MusicTrack[] }>({
    query: `query MyListeningHistory($take: Int!, $skip: Int!) { myListeningHistory(take: $take, skip: $skip) { ${TRACK_FIELDS} } }`,
    variables: { take, skip },
  });
  return data.myListeningHistory;
}

export interface ListeningStats {
  totalPlays: number;
  repeatedTracks: number;
  repeatPlays: number;
  daily: Array<{ date: string; listens: number }>;
}

export async function fetchMyListeningStats(): Promise<ListeningStats> {
  const data = await graphqlRequest<{ myListeningStats: ListeningStats }>({
    query: `query MyListeningStats { myListeningStats { totalPlays repeatedTracks repeatPlays daily { date listens } } }`,
  });
  return data.myListeningStats;
}

export async function recordTrackListen(item: PlaybackItem): Promise<void> {
  if (!getAccessToken()) return;

  if (
    !item.provider ||
    !item.providerTrackId ||
    !item.externalUrl ||
    !item.streamUrl ||
    !item.artists?.length
  )
    return;

  await graphqlRequest<{ recordTrackListen: boolean }>({
    query: `mutation RecordTrackListen($track: RecordTrackListenInput!) {
      recordTrackListen(track: $track)
    }`,
    variables: {
      track: {
        provider: item.provider,
        providerTrackId: item.providerTrackId,
        title: item.title,
        artists: item.artists,
        imageUrl: item.imageUrl,
        externalUrl: item.externalUrl,
        streamUrl: item.streamUrl,
        album: item.album,
        genre: item.genre,
        isrc: item.isrc,
        durationMs: Math.max(0, Math.round((item.duration ?? 0) * 1000)),
      },
    },
  });
}
