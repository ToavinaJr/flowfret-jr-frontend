export type AudioOwner = "player" | "metronome" | "synth";

export type AudioContextStatus = "suspended" | "running" | "closed";

export interface NotePlaybackRequest {
  stringIdx: number;
  fret: number;
}
