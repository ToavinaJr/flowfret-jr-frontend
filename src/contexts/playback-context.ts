import { createContext } from "react";
import type { ChordCue, PlaybackErrorCode, PlayState } from "@/types/song";
import type { MusicProvider } from "@/constants/domain";
import type { PracticeLoop } from "@/services/practiceLoop";

export type StemPreparationPhase = "queue" | "download" | "separation" | "finalizing" | null;

export interface PlaybackArtist {
  id: string;
  name: string;
}

export interface PlaybackItem {
  id: string;
  src: string;
  engine?: "audio" | "spotify" | "youtube";
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  duration?: number;
  destination?: string;
  trackActivity?: boolean;
  provider?: MusicProvider;
  providerTrackId?: string;
  artists?: PlaybackArtist[];
  externalUrl?: string;
  streamUrl?: string;
  genre?: string | null;
  isrc?: string | null;
  artist?: string;
  album?: string | null;
  chordCues?: ChordCue[];
  revokeSourceOnRelease?: boolean;
}

export interface PlaybackContextValue {
  item: PlaybackItem | null;
  lastEndedItemId: string | null;
  playbackEndSequence: number;
  playState: PlayState;
  playbackError: PlaybackErrorCode | null;
  currentTime: number;
  duration: number;
  volume: number;
  vocalRemoval: number;
  stemStatus: "idle" | "preparing" | "ready" | "failed";
  stemProgress: number;
  stemPhase: StemPreparationPhase;
  stemErrorCode: string | null;
  stemSimulated?: boolean;
  prepareStems: () => Promise<void>;
  setVocalRemoval: (value: number) => Promise<void>;
  queue: PlaybackItem[];
  currentIndex: number;
  shuffle: boolean;
  select: (item: PlaybackItem) => void;
  play: (item?: PlaybackItem) => Promise<void>;
  pause: () => void;
  toggle: (item?: PlaybackItem) => Promise<void>;
  retry: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (items: PlaybackItem[], startIndex?: number) => void;
  setShuffle: (enabled: boolean) => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  practiceLoop: PracticeLoop;
  setPracticeLoopStart: () => void;
  setPracticeLoopEnd: () => boolean;
  setPracticeLoopEnabled: (enabled: boolean) => void;
  clearPracticeLoop: () => void;
}

export const PlaybackContext = createContext<PlaybackContextValue | null>(null);
