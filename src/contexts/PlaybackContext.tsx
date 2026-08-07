import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { PlayState } from "@/types/song";

export interface PlaybackItem {
  id: string;
  src: string;
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  duration?: number;
  destination?: string;
}

interface PlaybackContextValue {
  item: PlaybackItem | null;
  playState: PlayState;
  currentTime: number;
  duration: number;
  volume: number;
  select: (item: PlaybackItem) => void;
  play: (item?: PlaybackItem) => Promise<void>;
  pause: () => void;
  toggle: (item?: PlaybackItem) => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const itemRef = useRef<PlaybackItem | null>(null);
  const [item, setItem] = useState<PlaybackItem | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumeState, setVolumeState] = useState(1);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.volume = 1;
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMetadata = () => setDuration(audio.duration || itemRef.current?.duration || 0);
    const onPlay = () => setPlayState("playing");
    const onPause = () => setPlayState((state) => state === "error" ? state : "paused");
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
    };
  }, []);

  const select = useCallback((next: PlaybackItem) => {
    if (itemRef.current?.id === next.id && itemRef.current.src === next.src) return;
    const audio = audioRef.current;
    itemRef.current = next;
    setItem(next);
    setCurrentTime(0);
    setDuration(next.duration || 0);
    setPlayState("loading");
    if (audio) {
      audio.src = next.src;
      audio.load();
    }
    setPlayState("paused");
  }, []);

  const play = useCallback(async (next?: PlaybackItem) => {
    if (next) select(next);
    const audio = audioRef.current;
    if (!audio || (!next && !itemRef.current)) return;
    try {
      await audio.play();
      setPlayState("playing");
    } catch {
      setPlayState("error");
    }
  }, [select]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlayState("paused");
  }, []);

  const toggle = useCallback(async (next?: PlaybackItem) => {
    const isSame = !next || (itemRef.current?.id === next.id && itemRef.current.src === next.src);
    if (isSame && !audioRef.current?.paused) pause();
    else await play(next);
  }, [pause, play]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || time));
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((next: number) => {
    const safe = Math.max(0, Math.min(1, next));
    if (audioRef.current) audioRef.current.volume = safe;
    setVolumeState(safe);
  }, []);

  const value = useMemo(() => ({ item, playState, currentTime, duration, volume: volumeState, select, play, pause, toggle, seek, setVolume }), [item, playState, currentTime, duration, volumeState, select, play, pause, toggle, seek, setVolume]);
  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlayback(): PlaybackContextValue {
  const context = useContext(PlaybackContext);
  if (!context) throw new Error("usePlayback must be used inside PlaybackProvider");
  return context;
}
