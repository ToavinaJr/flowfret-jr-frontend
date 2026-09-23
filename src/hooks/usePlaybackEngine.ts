import { useCallback, useEffect, useRef, useState } from "react";
import { recordTrackListen } from "@/services/api";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { PlayState } from "@/types/song";
import { useSpotifyController } from "./useSpotifyController";
import { useYouTubeController } from "./useYouTubeController";

export function usePlaybackEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const itemRef = useRef<PlaybackItem | null>(null);
  const loggedItemRef = useRef<string | null>(null);
  const [item, setItem] = useState<PlaybackItem | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const spotify = useSpotifyController({
    setPlayState,
    setCurrentTime,
    setDuration,
  });
  const youtube = useYouTubeController();

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
    audio.volume = 1;
    audioRef.current = audio;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMetadata = () =>
      setDuration(audio.duration || itemRef.current?.duration || 0);
    const onPlay = () => setPlayState("playing");
    const onPause = () =>
      setPlayState((state) => (state === "error" ? state : "paused"));
    const onEnded = () => setPlayState("paused");
    const onError = () => setPlayState("error");
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
      releaseSource(itemRef.current);
    };
  }, [releaseSource]);

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
      recordListen(active, loggedItemRef);
      try {
        if (active.engine === "spotify") {
          const controller = await spotify.getController(active.src);
          if (same && spotify.uriRef.current === active.src) controller.resume();
          else controller.play();
        } else if (active.engine === "youtube") {
          youtube.play(active.src);
          setPlayState("playing");
        } else {
          await audioRef.current?.play();
          setPlayState("playing");
        }
      } catch {
        setPlayState("error");
      }
    },
    [select, spotify, youtube],
  );

  const pause = useCallback(() => {
    if (itemRef.current?.engine === "spotify") spotify.pause();
    else if (itemRef.current?.engine === "youtube") youtube.pause();
    else audioRef.current?.pause();
    setPlayState("paused");
  }, [spotify, youtube]);

  const seek = useCallback(
    (time: number) => {
      if (itemRef.current?.engine === "spotify") {
        spotify.seek(time);
        setCurrentTime(time);
      } else if (itemRef.current?.engine === "youtube") {
        youtube.seek(time);
        setCurrentTime(time);
      } else if (audioRef.current) {
        const audio = audioRef.current;
        audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
        setCurrentTime(audio.currentTime);
      }
    },
    [spotify, youtube],
  );

  const setVolume = useCallback((next: number) => {
    const safe = Math.max(0, Math.min(1, next));
    if (audioRef.current) audioRef.current.volume = safe;
    setVolumeState(safe);
  }, []);

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
    seek,
    setVolume,
  };
}

function recordListen(
  item: PlaybackItem,
  loggedItemRef: { current: string | null },
) {
  if (item.trackActivity === false || loggedItemRef.current === item.id) return;
  loggedItemRef.current = item.id;
  void recordTrackListen(item.id).catch(() => {
    loggedItemRef.current = null;
  });
}
