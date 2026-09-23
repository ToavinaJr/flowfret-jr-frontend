import type { MusicProvider } from "@/constants/domain";

export type PlaylistVisibility = "PRIVATE" | "FRIENDS" | "PUBLIC";

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  visibility: PlaylistVisibility;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrack {
  id: string;
  provider: MusicProvider;
  providerTrackId: string;
  title: string;
  artists: Array<{ id: string; name: string }>;
  album: string | null;
  genre: string | null;
  imageUrl: string | null;
  externalUrl: string;
  durationMs: number;
  isrc: string | null;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  trackId: string;
  addedById: string;
  position: number;
  track: PlaylistTrack;
}
