import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { recordTrackListen } from "@/services/listeningHistoryApi";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { PlayState } from "@/types/song";
import { useSpotifyController } from "./useSpotifyController";
import { useYouTubeController } from "./useYouTubeController";

interface InitialPlaybackState {
  item: PlaybackItem | null;
  currentTime: number;
  volume: number;
}

export function usePlaybackEngine(
  onEnded?: () => void,
  initial?: InitialPlaybackState,
) {
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const itemRef = useRef<PlaybackItem | null>(initial?.item ?? null);
  const resumeAtRef = useRef(initial?.currentTime ?? 0);
  const loggedItemRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const handleYouTubeEnded = useCallback(() => onEndedRef.current?.(), []);
  const [item, setItem] = useState<PlaybackItem | null>(initial?.item ?? null);
  const [playState, setPlayState] = useState<PlayState>(
    initial?.item ? "paused" : "idle",
  );
  const [currentTime, setCurrentTime] = useState(initial?.currentTime ?? 0);
  const [duration, setDuration] = useState(initial?.item?.duration ?? 0);
  const [volume, setVolumeState] = useState(initial?.volume ?? 1);
  const updateCurrentTime = useCallback((time: number) => {
    resumeAtRef.current = time;
    setCurrentTime(time);
  }, []);
  const spotify = useSpotifyController({
    setPlayState,
    setCurrentTime: updateCurrentTime,
    setDuration,
  });
  const youtube = useYouTubeController({
    setPlayState,
    setCurrentTime: updateCurrentTime,
    setDuration,
    onEnded: handleYouTubeEnded,
  });

  const releaseSource = useCallback((releasedItem: PlaybackItem | null) => {
    if (
      releasedItem?.revokeSourceOnRelease &&
      releasedItem.src.startsWith("blob:")
    )
      URL.revokeObjectURL(releasedItem.src);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = initial?.volume ?? 1;
    audioRef.current = audio;
    const onTime = () => {
      resumeAtRef.current = audio.currentTime;
      updateCurrentTime(audio.currentTime);
    };
    const onMetadata = () => {
      setDuration(audio.duration || itemRef.current?.duration || 0);
      if (resumeAtRef.current > 0)
        audio.currentTime = Math.min(resumeAtRef.current, audio.duration || resumeAtRef.current);
    };
    const onPlay = () => setPlayState("playing");
    const onPause = () =>
      setPlayState((state) => (state === "error" ? state : "paused"));
    const handleEnded = () => {
      setPlayState("paused");
      onEndedRef.current?.();
    };
    const onError = () => setPlayState("error");
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", onError);
    const restoredItem = itemRef.current;
    if ((restoredItem?.engine ?? "audio") === "audio" && restoredItem) {
      audio.src = restoredItem.src;
      audio.load();
    }
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
      releaseSource(itemRef.current);
    };
    // Initial values are intentionally captured once when the engine is created.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [releaseSource, updateCurrentTime]);

  const select = useCallback(
    (next: PlaybackItem) => {
      if (itemRef.current?.id === next.id && itemRef.current.src === next.src)
        return;
      const previous = itemRef.current;
      if (previous?.engine === "spotify") spotify.pause();
      else if (previous?.engine === "youtube") youtube.pause();
      else audioRef.current?.pause();
      releaseSource(previous);
      itemRef.current = next;
      resumeAtRef.current = 0;
      setItem(next);
      setCurrentTime(0);
      setDuration(next.duration || 0);
      setPlayState("loading");
      if ((next.engine ?? "audio") === "audio" && audioRef.current) {
        audioRef.current.src = next.src;
        audioRef.current.load();
      }
      setPlayState("paused");
    },
    [releaseSource, spotify, youtube],
  );

  const play = useCallback(
    async (next?: PlaybackItem) => {
      const same =
        !next ||
        (itemRef.current?.id === next.id && itemRef.current.src === next.src);
      if (next) select(next);
      const active = next ?? itemRef.current;
      if (!active) return;
      const generation = generationRef.current;
      recordListen(active, loggedItemRef, () =>
        queryClient.invalidateQueries({ queryKey: ["listening-history"] }),
      );
      try {
        if (active.engine === "spotify") {
          const controller = await spotify.getController(active.src);
          if (generation !== generationRef.current) return;
          if (resumeAtRef.current > 0) controller.seek(resumeAtRef.current);
          if (same && spotify.uriRef.current === active.src) controller.resume();
          else controller.play();
        } else if (active.engine === "youtube") {
          youtube.play(active.src, resumeAtRef.current);
          setPlayState("playing");
        } else {
          await audioRef.current?.play();
          if (generation === generationRef.current) setPlayState("playing");
        }
      } catch {
        if (generation === generationRef.current) setPlayState("error");
      }
    },
    [queryClient, select, spotify, youtube],
  );

  const pause = useCallback(() => {
    if (itemRef.current?.engine === "spotify") spotify.pause();
    else if (itemRef.current?.engine === "youtube") youtube.pause();
    else audioRef.current?.pause();
    setPlayState("paused");
  }, [spotify, youtube]);

  const clear = useCallback(() => {
    generationRef.current += 1;
    const previous = itemRef.current;
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    spotify.reset();
    youtube.reset();
    releaseSource(previous);
    itemRef.current = null;
    resumeAtRef.current = 0;
    loggedItemRef.current = null;
    setItem(null);
    setPlayState("idle");
    setCurrentTime(0);
    setDuration(0);
  }, [releaseSource, spotify, youtube]);

  const seek = useCallback(
    (time: number) => {
      if (itemRef.current?.engine === "spotify") {
        spotify.seek(time);
        resumeAtRef.current = time;
        setCurrentTime(time);
      } else if (itemRef.current?.engine === "youtube") {
        youtube.seek(time);
        resumeAtRef.current = time;
        setCurrentTime(time);
      } else if (audioRef.current) {
        const audio = audioRef.current;
        audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
        resumeAtRef.current = audio.currentTime;
        setCurrentTime(audio.currentTime);
      }
    },
    [spotify, youtube],
  );

  const setVolume = useCallback(
    (next: number) => {
      const safe = Math.max(0, Math.min(1, next));
      if (itemRef.current?.engine === "youtube") youtube.setVolume(safe);
      else if (audioRef.current) audioRef.current.volume = safe;
      setVolumeState(safe);
    },
    [youtube],
  );

  return {
    item,
    playState,
    currentTime,
    duration,
    volume,
    spotifyHostRef: spotify.hostRef,
    youtubeHostRef: youtube.hostRef,
    select,
    play,
    pause,
    clear,
    seek,
    setVolume,
  };
}

function recordListen(
  item: PlaybackItem,
  loggedItemRef: { current: string | null },
  onRecorded: () => void,
) {
  if (item.trackActivity === false || loggedItemRef.current === item.id) return;
  loggedItemRef.current = item.id;
  void recordTrackListen(item)
    .then(onRecorded)
    .catch(() => {
      loggedItemRef.current = null;
    });
}
