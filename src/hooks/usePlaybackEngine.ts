import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { recordTrackListen } from "@/services/listeningHistoryApi";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { PlaybackErrorCode, PlayState } from "@/types/song";
import { useSpotifyController } from "./useSpotifyController";
import { useYouTubeController } from "./useYouTubeController";
import { useVocalRemoval } from "./useVocalRemoval";
import { clampGain } from "@/services/stemMixer";

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
  const restorePendingRef = useRef((initial?.currentTime ?? 0) > 0);
  const loggedItemRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  const [item, setItem] = useState<PlaybackItem | null>(initial?.item ?? null);
  const [playState, setPlayState] = useState<PlayState>(
    initial?.item ? "paused" : "idle",
  );
  const [currentTime, setCurrentTime] = useState(initial?.currentTime ?? 0);
  const [duration, setDuration] = useState(initial?.item?.duration ?? 0);
  const [volume, setVolumeState] = useState(initial?.volume ?? 1);
  const [playbackError, setPlaybackError] = useState<PlaybackErrorCode | null>(
    null,
  );
  const handleStemEnded = useCallback(() => {
    setPlayState("paused");
    onEndedRef.current?.();
  }, []);
  const stems = useVocalRemoval(handleStemEnded);
  const { activeRef: stemsActive, mixerRef, reset: resetStems } = stems;
  const setNativePlayState = useCallback((state: Parameters<typeof setPlayState>[0]) => {
    if (!stemsActive.current) setPlayState(state);
  }, [stemsActive]);
  const setNativeDuration = useCallback((value: number) => {
    if (!stemsActive.current) setDuration(value);
  }, [stemsActive]);
  const handleYouTubeEnded = useCallback(() => {
    if (!stemsActive.current) onEndedRef.current?.();
  }, [stemsActive]);
  const updateCurrentTime = useCallback((time: number) => {
    if (stemsActive.current) return;
    resumeAtRef.current = time;
    setCurrentTime(time);
  }, [stemsActive]);
  const handleYouTubeError = useCallback(() => {
    if (stemsActive.current) return;
    setPlaybackError("PROVIDER_UNAVAILABLE");
    setPlayState("error");
  }, [stemsActive]);
  const spotify = useSpotifyController({
    setPlayState: setNativePlayState,
    setCurrentTime: updateCurrentTime,
    setDuration: setNativeDuration,
  });
  const youtube = useYouTubeController({
    setPlayState: setNativePlayState,
    setCurrentTime: updateCurrentTime,
    setDuration: setNativeDuration,
    onEnded: handleYouTubeEnded,
    onError: handleYouTubeError,
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
      if (stemsActive.current || restorePendingRef.current) return;
      if (audio.readyState < HTMLMediaElement.HAVE_METADATA) return;
      resumeAtRef.current = audio.currentTime;
      updateCurrentTime(audio.currentTime);
    };
    const onMetadata = () => {
      if (stemsActive.current) return;
      setDuration(audio.duration || itemRef.current?.duration || 0);
      if (resumeAtRef.current > 0) {
        const position = Math.min(resumeAtRef.current, audio.duration || resumeAtRef.current);
        restorePendingRef.current = position > 0;
        audio.currentTime = position;
        resumeAtRef.current = position;
        setCurrentTime(position);
      }
    };
    const onSeeked = () => {
      if (!restorePendingRef.current || stemsActive.current) return;
      restorePendingRef.current = false;
      resumeAtRef.current = audio.currentTime;
      setCurrentTime(audio.currentTime);
    };
    const onPlay = () => setNativePlayState("playing");
    const onWaiting = () => setNativePlayState("loading");
    const onCanPlay = () => {
      if (!audio.paused) setNativePlayState("playing");
    };
    const onPause = () =>
      setNativePlayState((state) => (state === "error" ? state : "paused"));
    const handleEnded = () => {
      if (stemsActive.current) return;
      setPlayState("paused");
      onEndedRef.current?.();
    };
    const onError = () => {
      if (stemsActive.current) return;
      setPlaybackError("AUDIO_UNAVAILABLE");
      setPlayState("error");
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("stalled", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
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
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("stalled", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
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
      generationRef.current += 1;
      resetStems();
      if (previous?.engine === "spotify") spotify.pause();
      else if (previous?.engine === "youtube") youtube.pause();
      else audioRef.current?.pause();
      releaseSource(previous);
      itemRef.current = next;
      resumeAtRef.current = 0;
      restorePendingRef.current = false;
      setItem(next);
      setCurrentTime(0);
      setDuration(next.duration || 0);
      setPlaybackError(null);
      setPlayState("loading");
      if ((next.engine ?? "audio") === "audio" && audioRef.current) {
        audioRef.current.src = next.src;
        audioRef.current.load();
      }
    },
    [releaseSource, spotify, youtube, resetStems],
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
      setPlaybackError(null);
      setPlayState("loading");
      recordListen(active, loggedItemRef, () =>
        queryClient.invalidateQueries({ queryKey: ["listening-history"] }),
      );
      try {
        if (stemsActive.current && mixerRef.current) {
          await mixerRef.current.resume();
          if (generation === generationRef.current) setPlayState("playing");
        } else if (active.engine === "spotify") {
          const controller = await spotify.getController(active.src);
          if (generation !== generationRef.current) return;
          if (resumeAtRef.current > 0) controller.seek(resumeAtRef.current);
          if (same && spotify.uriRef.current === active.src) controller.resume();
          else controller.play();
        } else if (active.engine === "youtube") {
          youtube.play(active.src, resumeAtRef.current);
        } else {
          await audioRef.current?.play();
          if (generation === generationRef.current) setPlayState("playing");
        }
      } catch (error) {
        if (generation !== generationRef.current) return;
        setPlaybackError(
          error instanceof DOMException && error.name === "NotAllowedError"
            ? "PLAYBACK_BLOCKED"
            : "PROVIDER_UNAVAILABLE",
        );
        setPlayState("error");
      }
    },
    [queryClient, select, spotify, youtube, stemsActive, mixerRef],
  );

  const retry = useCallback(async () => {
    const active = itemRef.current;
    if (!active) return;
    if (stemsActive.current) {
      await play();
      return;
    }
    if (active.engine === "audio" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    } else if (active.engine === "youtube") {
      youtube.reset();
    }
    await play(active);
  }, [play, youtube, stemsActive]);

  const pause = useCallback(() => {
    generationRef.current += 1;
    if (stemsActive.current) mixerRef.current?.pause();
    else if (itemRef.current?.engine === "spotify") spotify.pause();
    else if (itemRef.current?.engine === "youtube") youtube.pause();
    else audioRef.current?.pause();
    setPlayState("paused");
  }, [spotify, youtube, stemsActive, mixerRef]);

  const clear = useCallback(() => {
    generationRef.current += 1;
    resetStems();
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
    setPlaybackError(null);
    setCurrentTime(0);
    setDuration(0);
  }, [releaseSource, spotify, youtube, resetStems]);

  const seek = useCallback(
    (time: number) => {
      if (stemsActive.current && mixerRef.current) {
        mixerRef.current.seek(time);
        resumeAtRef.current = mixerRef.current.currentTime;
        setCurrentTime(resumeAtRef.current);
      } else if (itemRef.current?.engine === "spotify") {
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
    [spotify, youtube, stemsActive, mixerRef],
  );

  const setVolume = useCallback(
    (next: number) => {
      const safe = Math.max(0, Math.min(1, next));
      mixerRef.current?.setVolume(safe);
      if (itemRef.current?.engine === "youtube") youtube.setVolume(safe);
      else if (audioRef.current) audioRef.current.volume = safe;
      setVolumeState(safe);
    },
    [youtube, mixerRef],
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!stemsActive.current || !mixerRef.current) return;
      resumeAtRef.current = mixerRef.current.currentTime;
      setCurrentTime(resumeAtRef.current);
    }, 100);
    return () => window.clearInterval(timer);
  }, [stemsActive, mixerRef]);

  async function setVocalRemoval(value: number) {
    const mixer = mixerRef.current;
    if (!mixer) return;
    const safe = clampGain(value);
    mixer.setRemoval(safe);
    stems.setRemoval(safe);
    if (stemsActive.current || safe === 0) return;
    generationRef.current += 1;
    const generation = generationRef.current;
    const playing = playState === "playing";
    stemsActive.current = true;
    if (itemRef.current?.engine === "youtube") youtube.pause();
    else audioRef.current?.pause();
    const nativeAudio = audioRef.current;
    const currentPosition = nativeAudio && nativeAudio.readyState >= HTMLMediaElement.HAVE_METADATA && !restorePendingRef.current
      ? nativeAudio.currentTime
      : resumeAtRef.current;
    resumeAtRef.current = currentPosition;
    mixer.seek(currentPosition);
    mixer.setVolume(volume);
    setDuration(mixer.duration);
    if (playing) {
      try {
        await mixer.resume();
        if (generation === generationRef.current) setPlayState("playing");
      } catch {
        if (generation === generationRef.current) {
          setPlaybackError("PLAYBACK_BLOCKED");
          setPlayState("error");
        }
      }
    } else setPlayState("paused");
  }

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
    retry,
    seek,
    setVolume,
    playbackError,
    vocalRemoval: stems.removal,
    stemSimulated: stems.simulated,
    stemStatus: stems.status,
    stemProgress: stems.progress,
    stemPhase: stems.phase,
    stemErrorCode: stems.errorCode,
    prepareStems: () => itemRef.current ? stems.prepare(itemRef.current) : Promise.resolve(),
    setVocalRemoval,
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
