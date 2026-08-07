export interface MusicArtist {
  id: string;
  name: string;
}

export interface MusicTrack {
  youtubeId: string;
  title: string;
  artists: MusicArtist[];
  imageUrl: string | null;
  youtubeUrl: string;
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
