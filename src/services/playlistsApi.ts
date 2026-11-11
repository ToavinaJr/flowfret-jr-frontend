import { graphqlRequest } from "./graphqlClient";
import type { MusicTrack } from "@/types/music";
import type { Playlist, PlaylistItem, PlaylistTrack, PlaylistVisibility } from "@/types/playlist";

const PLAYLIST_FIELDS = `
  id userId name description coverUrl visibility version createdAt updatedAt
`;
const ITEM_FIELDS = `
  id playlistId trackId addedById position
  track { id provider providerTrackId title artists { id name } album genre imageUrl externalUrl durationMs isrc }
`;

export async function fetchPlaylists(): Promise<Playlist[]> {
  const data = await graphqlRequest<{ myPlaylists: Playlist[] }>({
    query: `query MyPlaylists { myPlaylists { ${PLAYLIST_FIELDS} } }`,
  });
  return data.myPlaylists;
}

export async function fetchPlaylistItems(id: string, after?: string): Promise<PlaylistItem[]> {
  const data = await graphqlRequest<{ playlistItems: PlaylistItem[] }>({
    query: `query PlaylistItems($id: String!, $take: Int!, $after: String) { playlistItems(playlistId: $id, take: $take, after: $after) { ${ITEM_FIELDS} } }`,
    variables: { id, take: 100, after },
  });
  return data.playlistItems;
}

export async function createPlaylist(name: string, details?: { description?: string | null; coverUrl?: string | null }): Promise<Playlist> {
  const data = await graphqlRequest<{ createPlaylist: Playlist }>({
    query: `mutation CreatePlaylist($data: CreatePlaylistInput!) { createPlaylist(data: $data) { ${PLAYLIST_FIELDS} } }`,
    variables: { data: { name, ...details } },
  });
  return data.createPlaylist;
}

export async function updatePlaylist(id: string, data: { name?: string; description?: string | null; coverUrl?: string | null; visibility?: PlaylistVisibility }): Promise<Playlist> {
  const result = await graphqlRequest<{ updatePlaylist: Playlist }>({
    query: `mutation UpdatePlaylist($id: String!, $data: UpdatePlaylistInput!) { updatePlaylist(id: $id, data: $data) { ${PLAYLIST_FIELDS} } }`,
    variables: { id, data },
  });
  return result.updatePlaylist;
}

export async function deletePlaylist(id: string): Promise<void> {
  await graphqlRequest<{ deletePlaylist: boolean }>({
    query: `mutation DeletePlaylist($id: String!) { deletePlaylist(id: $id) }`,
    variables: { id },
  });
}

export async function addTrackToPlaylist(
  playlistId: string,
  track: MusicTrack | PlaylistTrack,
): Promise<PlaylistItem> {
  const data = await graphqlRequest<{ addTrackToPlaylist: PlaylistItem }>({
    query: `mutation AddTrack($data: AddTrackToPlaylistInput!) { addTrackToPlaylist(data: $data) { ${ITEM_FIELDS} } }`,
    variables: {
      data: {
        playlistId,
        track: {
          provider: track.provider,
          providerTrackId: track.providerTrackId,
          title: track.title,
          artists: track.artists,
          album: track.album,
          genre: track.genre,
          imageUrl: track.imageUrl,
          externalUrl: track.externalUrl,
          durationMs: track.durationMs,
          isrc: track.isrc,
        },
      },
    },
  });
  return data.addTrackToPlaylist;
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  itemId: string,
): Promise<void> {
  await graphqlRequest<{ removeTrackFromPlaylist: boolean }>({
    query: `mutation RemoveTrack($playlistId: String!, $itemId: String!) { removeTrackFromPlaylist(playlistId: $playlistId, itemId: $itemId) }`,
    variables: { playlistId, itemId },
  });
}

export async function reorderPlaylist(
  playlistId: string,
  orderedItemIds: string[],
  expectedVersion: number,
): Promise<Playlist> {
  const data = await graphqlRequest<{ reorderPlaylistItems: Playlist }>({
    query: `mutation Reorder($data: ReorderPlaylistItemsInput!) { reorderPlaylistItems(data: $data) { ${PLAYLIST_FIELDS} } }`,
    variables: { data: { playlistId, orderedItemIds, expectedVersion } },
  });
  return data.reorderPlaylistItems;
}
