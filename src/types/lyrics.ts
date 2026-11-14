export interface LyricLine {
  startTimeMs: number | null;
  endTimeMs?: number | null;
  text: string;
}

export interface Lyrics {
  provider: string;
  synced: boolean;
  instrumental: boolean;
  plainLyrics?: string;
  lines: LyricLine[];
}

export type LyricsStatus = "idle" | "loading" | "success" | "not-found" | "error";

export interface LyricsTrack {
  id: string;
  provider: string;
  title: string;
  artist: string;
  album?: string | null;
  duration?: number;
}
