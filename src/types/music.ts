export interface MusicArtist {
  id: string;
  name: string;
}

export interface MusicTrack {
  spotifyId: string;
  title: string;
  artists: MusicArtist[];
  albumId: string;
  albumName: string;
  imageUrl: string | null;
  spotifyUrl: string;
  previewUrl: string | null;
  geniusUrl: string | null;
  geniusMatchScore: number | null;
  durationMs: number;
}

export interface MusicSearchResult {
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
