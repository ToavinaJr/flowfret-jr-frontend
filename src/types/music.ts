export interface MusicArtist {
  id: string;
  name: string;
}

export interface MusicTrack {
  provider: "YOUTUBE" | "AUDIUS" | "SPOTIFY";
  id: string;
  audiusId: string;
  title: string;
  artists: MusicArtist[];
  imageUrl: string | null;
  audiusUrl: string;
  externalUrl: string;
  album: string | null;
  isrc: string | null;
  streamUrl: string;
  genre: string | null;
  geniusUrl: string | null;
  geniusMatchScore: number | null;
  durationMs: number;
}

export interface MusicSearchResult {
  provider: "YOUTUBE" | "AUDIUS" | "SPOTIFY";
  tracks: MusicTrack[];
  total: number;
}

export interface SearchMusicQueryData {
  searchMusic: MusicSearchResult;
}

export interface SearchMusicQueryVariables {
  query: string;
  limit: number;
}
