import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { usePlaybackEngine } from "@/hooks/usePlaybackEngine";
import { usePlaybackMediaSession } from "@/hooks/usePlaybackMediaSession";
import { usePlaybackPersistence } from "@/hooks/usePlaybackPersistence";
import { usePlaybackQueue } from "@/hooks/usePlaybackQueue";
import { usePlaybackTabCoordination } from "@/hooks/usePlaybackTabCoordination";
import {
  PLAYBACK_LOGOUT_EVENT,
  readPlaybackSession,
} from "@/services/playbackSession";
import { useTranslation } from "react-i18next";
import {
  PlaybackContext,
  type PlaybackContextValue,
  type PlaybackItem,
} from "./playback-context";

export type {
  PlaybackArtist,
  PlaybackContextValue,
  PlaybackItem,
} from "./playback-context";

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [restoredSession] = useState(() => readPlaybackSession());
  const queue = usePlaybackQueue(restoredSession);
  const playNextRef = useRef<((item: PlaybackItem) => Promise<void>) | null>(
    null,
  );
  const handleEnded = useCallback(() => {
    const item = queue.next();
    if (item) void playNextRef.current?.(item);
  }, [queue]);
  const engine = usePlaybackEngine(handleEnded, {
    item: restoredSession?.item ?? null,
    currentTime: restoredSession?.currentTime ?? 0,
    volume: restoredSession?.volume ?? 1,
  });
  const clearPlaybackRef = useRef(engine.clear);
  clearPlaybackRef.current = engine.clear;
  const clearQueue = queue.setQueue;
  const resetShuffle = queue.setShuffle;
  const pausePlayback = engine.pause;
  const seekPlayback = engine.seek;
  playNextRef.current = engine.play;

  useEffect(() => {
    const clear = () => {
      clearPlaybackRef.current();
      clearQueue([]);
      resetShuffle(false);
    };
    window.addEventListener(PLAYBACK_LOGOUT_EVENT, clear);
    return () => window.removeEventListener(PLAYBACK_LOGOUT_EVENT, clear);
  }, [clearQueue, resetShuffle]);

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

  usePlaybackPersistence({
    item: engine.item,
    queue: queue.queue,
    currentIndex: queue.currentIndex,
    currentTime: engine.currentTime,
    volume: engine.volume,
    shuffle: queue.shuffle,
  });
  usePlaybackTabCoordination(engine.playState, pausePlayback);
  usePlaybackMediaSession({
    item: engine.item,
    playState: engine.playState,
    currentTime: engine.currentTime,
    duration: engine.duration,
    play,
    pause: pausePlayback,
    next,
    previous,
    seek: seekPlayback,
  });

  const value = useMemo<PlaybackContextValue>(
    () => ({
      item: engine.item,
      playState: engine.playState,
      playbackError: engine.playbackError,
      currentTime: engine.currentTime,
      duration: engine.duration,
      volume: engine.volume,
      vocalRemoval: engine.vocalRemoval,
      stemStatus: engine.stemStatus,
      stemProgress: engine.stemProgress,
      stemPhase: engine.stemPhase,
      stemErrorCode: engine.stemErrorCode,
      stemSimulated: engine.stemSimulated,
      prepareStems: engine.prepareStems,
      setVocalRemoval: engine.setVocalRemoval,
      queue: queue.queue,
      currentIndex: queue.currentIndex,
      shuffle: queue.shuffle,
      select,
      play,
      pause: engine.pause,
      toggle,
      retry: engine.retry,
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
        title={t("mediaPlayer.youtubePlayer")}
        allow="autoplay; encrypted-media"
        className="pointer-events-none fixed -bottom-24 left-0 h-20 w-[300px] opacity-0"
        aria-hidden="true"
      />
    </PlaybackContext.Provider>
  );
}
