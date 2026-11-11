import { graphqlRequest } from "@/services/graphqlClient";
import type { MusicTrack } from "@/types/music";

const FAVORITE_TRACK_FIELDS = `
  provider id providerTrackId audiusId title
  artists { id name } imageUrl audiusUrl externalUrl album isrc streamUrl
  genre geniusUrl geniusMatchScore durationMs
`;

export async function fetchFavoriteMusic(): Promise<MusicTrack[]> {
  const data = await graphqlRequest<{ myFavoriteMusic: MusicTrack[] }>({
    query: `query MyFavoriteMusic { myFavoriteMusic(take: 100, skip: 0) { ${FAVORITE_TRACK_FIELDS} } }`,
  });
  return data.myFavoriteMusic;
}

export async function setTrackFavorite(track: MusicTrack, favorite: boolean): Promise<boolean> {
  const data = await graphqlRequest<{ setTrackFavorite: boolean }>({
    query: `mutation SetTrackFavorite($track: RecordTrackListenInput!, $favorite: Boolean!) { setTrackFavorite(track: $track, favorite: $favorite) }`,
    variables: {
      favorite,
      track: {
        provider: track.provider,
        providerTrackId: track.providerTrackId,
        title: track.title,
        artists: track.artists,
        imageUrl: track.imageUrl,
        externalUrl: track.externalUrl,
        streamUrl: track.streamUrl,
        album: track.album,
        genre: track.genre,
        isrc: track.isrc,
        durationMs: track.durationMs,
      },
    },
  });
  return data.setTrackFavorite;
}
