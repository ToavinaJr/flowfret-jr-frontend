export interface ChordCue {
  start: number;
  end: number;
  chord: string;
}

export interface SongMeta {
  audioFile: string;
  title: string;
  duration: number;
  cues: ChordCue[];
}

export interface ImportedSong {
  meta: SongMeta;
  /** Playable blob: or http(s) URL */
  uri: string;
}

export type PlayState = "idle" | "loading" | "playing" | "paused" | "error";

export type PlaybackErrorCode =
  | "AUDIO_UNAVAILABLE"
  | "PROVIDER_UNAVAILABLE"
  | "PLAYBACK_BLOCKED";
