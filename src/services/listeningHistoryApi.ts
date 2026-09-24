import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { MusicTrack } from "@/types/music";
import { graphqlRequest } from "@/services/graphqlClient";

const TRACK_FIELDS = `
  provider id providerTrackId audiusId title imageUrl audiusUrl externalUrl
  album isrc streamUrl genre geniusUrl geniusMatchScore durationMs
  artists { id name }
`;

export async function fetchListeningHistory(): Promise<MusicTrack[]> {
  const data = await graphqlRequest<{ myListeningHistory: MusicTrack[] }>({
    query: `query MyListeningHistory { myListeningHistory(take: 20) { ${TRACK_FIELDS} } }`,
  });
  return data.myListeningHistory;
}

export async function recordTrackListen(item: PlaybackItem): Promise<void> {
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
