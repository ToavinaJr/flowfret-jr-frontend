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
import type { RepeatMode } from "@/services/playbackSession";
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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(restoredSession?.repeatMode ?? "off");
  const [sleepTimer, setSleepTimerState] = useState<{ kind: "track" } | { kind: "timer"; endsAt: number; minutes: number } | null>(null);
  const sleepTimerTimeoutRef = useRef<number | null>(null);
  const sleepTimerRef = useRef(sleepTimer);
  sleepTimerRef.current = sleepTimer;
  const clearSleepTimerRef = useRef<() => void>(() => undefined);
  const playNextRef = useRef<((item: PlaybackItem) => Promise<void>) | null>(
    null,
  );
  const playCurrentRef = useRef<(() => Promise<void>) | null>(null);
  const handleEnded = useCallback(() => {
    if (sleepTimerRef.current?.kind === "track") {
      clearSleepTimerRef.current();
      return;
    }
    if (repeatMode === "one") {
      void playCurrentRef.current?.();
      return;
    }
    const item = queue.next(repeatMode);
    if (item) void playNextRef.current?.(item);
  }, [queue, repeatMode]);
  const engine = usePlaybackEngine(handleEnded, {
    item: restoredSession?.item ?? null,
    currentTime: restoredSession?.currentTime ?? 0,
    volume: restoredSession?.volume ?? 1,
  });
  const clearPlaybackRef = useRef(engine.clear);
  clearPlaybackRef.current = engine.clear;
  const clearQueue = queue.setQueue;
  const resetShuffle = queue.setShuffle;
  const seekPlayback = engine.seek;
  playNextRef.current = engine.play;
  playCurrentRef.current = async () => {
    engine.seek(0);
    await engine.play();
  };

  const clearSleepTimer = useCallback(() => {
    if (sleepTimerTimeoutRef.current !== null) {
      window.clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }
    sleepTimerRef.current = null;
    setSleepTimerState(null);
  }, []);
  clearSleepTimerRef.current = clearSleepTimer;
  const setSleepTimer = useCallback((minutes: number | "track" | null) => {
    clearSleepTimer();
    if (minutes === null) return;
    if (minutes === "track") {
      const timer = { kind: "track" as const };
      sleepTimerRef.current = timer;
      setSleepTimerState(timer);
      return;
    }
    const endsAt = Date.now() + minutes * 60_000;
    const timer = { kind: "timer" as const, endsAt, minutes };
    sleepTimerRef.current = timer;
    setSleepTimerState(timer);
    sleepTimerTimeoutRef.current = window.setTimeout(() => {
      engine.pause();
      clearSleepTimer();
    }, Math.max(0, endsAt - Date.now()));
  }, [clearSleepTimer, engine.pause]);

  useEffect(() => {
    const clear = () => {
      clearPlaybackRef.current();
      clearQueue([]);
      resetShuffle(false);
      clearSleepTimer();
    };
    window.addEventListener(PLAYBACK_LOGOUT_EVENT, clear);
    return () => window.removeEventListener(PLAYBACK_LOGOUT_EVENT, clear);
  }, [clearQueue, resetShuffle, clearSleepTimer]);

  useEffect(() => () => {
    if (sleepTimerTimeoutRef.current !== null) window.clearTimeout(sleepTimerTimeoutRef.current);
  }, []);

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
    const item = queue.next(repeatMode === "queue" ? "queue" : "off");
    if (item) await engine.play(item);
  }, [engine, queue, repeatMode]);
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
    repeatMode,
  });
  usePlaybackMediaSession({
    item: engine.item,
    playState: engine.playState,
    currentTime: engine.currentTime,
    duration: engine.duration,
    play,
    pause: engine.pause,
    next,
    previous,
    seek: seekPlayback,
  });

  const value = useMemo<PlaybackContextValue>(
    () => ({
      item: engine.item,
      lastEndedItemId: engine.lastEndedItemId,
      playbackEndSequence: engine.playbackEndSequence,
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
      repeatMode,
      sleepTimer,
      select,
      play,
      pause: engine.pause,
      toggle,
      retry: engine.retry,
      seek: engine.seek,
      setVolume: engine.setVolume,
      setQueue,
      removeQueueItem: queue.removeItem,
      moveQueueItem: queue.moveItem,
      setShuffle: queue.setShuffle,
      setRepeatMode,
      setSleepTimer,
      next,
      previous,
      practiceLoop: engine.practiceLoop,
      setPracticeLoopStart: engine.setPracticeLoopStart,
      setPracticeLoopEnd: engine.setPracticeLoopEnd,
      setPracticeLoopEnabled: engine.setPracticeLoopEnabled,
      clearPracticeLoop: engine.clearPracticeLoop,
    }),
    [engine, next, play, previous, queue, select, setQueue, toggle, repeatMode, sleepTimer, setSleepTimer],
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
