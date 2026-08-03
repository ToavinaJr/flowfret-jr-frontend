import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayState } from "@/types/song";
import {
  registerAudioOwner,
  releaseAudioOwner,
  requestAudioOwner,
} from "@/utils/audioPriority";

interface UsePlayerAudioOptions {
  src: string | null;
}

interface UsePlayerAudioResult {
  playState: PlayState;
  currentTime: number;
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  toggle: () => Promise<void>;
}

export function usePlayerAudio({ src }: UsePlayerAudioOptions): UsePlayerAudioResult {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setPlayState("paused");
      releaseAudioOwner("player");
    };
    const onError = () => setPlayState("error");

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    const unregister = registerAudioOwner("player", () => {
      audio.pause();
      setPlayState("paused");
    });

    return () => {
      unregister();
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    setPlayState("loading");
    audio.src = src;
    audio.load();
    setCurrentTime(0);
    setPlayState("paused");
  }, [src]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    requestAudioOwner("player");
    try {
      await audio.play();
      setPlayState("playing");
    } catch {
      setPlayState("error");
    }
  }, [src]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlayState("paused");
    releaseAudioOwner("player");
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
    setCurrentTime(audio.currentTime);
  }, []);

  const toggle = useCallback(async () => {
    if (playState === "playing") {
      pause();
    } else {
      await play();
    }
  }, [playState, play, pause]);

  return { playState, currentTime, duration, play, pause, seek, toggle };
}
