import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { usePlaybackEngine } from "@/hooks/usePlaybackEngine";
import { usePlaybackQueue } from "@/hooks/usePlaybackQueue";
import type { PlayState } from "@/types/song";

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
  provider?: string;
  artist?: string;
  album?: string | null;
  revokeSourceOnRelease?: boolean;
}

interface PlaybackContextValue {
  item: PlaybackItem | null;
  playState: PlayState;
  currentTime: number;
  duration: number;
  volume: number;
  queue: PlaybackItem[];
  currentIndex: number;
  shuffle: boolean;
  select: (item: PlaybackItem) => void;
  play: (item?: PlaybackItem) => Promise<void>;
  pause: () => void;
  toggle: (item?: PlaybackItem) => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setQueue: (items: PlaybackItem[], startIndex?: number) => void;
  setShuffle: (enabled: boolean) => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const queue = usePlaybackQueue();
  const playNextRef = useRef<((item: PlaybackItem) => Promise<void>) | null>(
    null,
  );
  const handleEnded = useCallback(() => {
    const item = queue.next();
    if (item) void playNextRef.current?.(item);
  }, [queue]);
  const engine = usePlaybackEngine(handleEnded);
  playNextRef.current = engine.play;

  const select = useCallback(
    (item: PlaybackItem) => {
      queue.syncSelection(item);
      engine.select(item);
    },
    [engine, queue],
  );
  const play = useCallback(
    async (item?: PlaybackItem) => {
      if (item) queue.syncSelection(item);
      await engine.play(item);
    },
    [engine, queue],
  );
  const toggle = useCallback(
    async (item?: PlaybackItem) => {
      const same =
        !item ||
        (engine.item?.id === item.id && engine.item.src === item.src);
      if (same && engine.playState === "playing") engine.pause();
      else await play(item);
    },
    [engine, play],
  );
  const setQueue = useCallback(
    (items: PlaybackItem[], startIndex = 0) => {
      const selected = queue.setQueue(items, startIndex);
      if (selected) engine.select(selected);
    },
    [engine, queue],
  );
  const next = useCallback(async () => {
    const item = queue.next();
    if (item) await engine.play(item);
  }, [engine, queue]);
  const previous = useCallback(async () => {
    const item = queue.previous();
    if (item) await engine.play(item);
  }, [engine, queue]);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      item: engine.item,
      playState: engine.playState,
      currentTime: engine.currentTime,
      duration: engine.duration,
      volume: engine.volume,
      queue: queue.queue,
      currentIndex: queue.currentIndex,
      shuffle: queue.shuffle,
      select,
      play,
      pause: engine.pause,
      toggle,
      seek: engine.seek,
      setVolume: engine.setVolume,
      setQueue,
      setShuffle: queue.setShuffle,
      next,
      previous,
    }),
    [engine, next, play, previous, queue, select, setQueue, toggle],
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
      <div
        ref={engine.spotifyHostRef}
        className="pointer-events-none fixed -bottom-24 left-0 h-20 w-[300px] opacity-0"
        aria-hidden="true"
      />
      <iframe
        ref={engine.youtubeHostRef}
        title="YouTube playlist player"
        allow="autoplay; encrypted-media"
        className="pointer-events-none fixed -bottom-24 left-0 h-20 w-[300px] opacity-0"
        aria-hidden="true"
      />
    </PlaybackContext.Provider>
  );
}

export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext);
  if (!context)
    throw new Error("usePlayback must be used inside PlaybackProvider");
  return context;
}
