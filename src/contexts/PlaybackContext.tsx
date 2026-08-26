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
import { recordTrackListen } from "@/services/api";

export interface PlaybackItem {
  id: string;
  src: string;
  engine?: "audio" | "spotify";
  title: string;
  subtitle: string;
  imageUrl?: string | null;
  duration?: number;
  destination?: string;
  trackActivity?: boolean;
  provider?: string;
  artist?: string;
  album?: string | null;
}

interface SpotifyPlaybackEvent {
  data: {
    isPaused: boolean;
    isBuffering: boolean;
    duration: number;
    position: number;
  };
}

interface SpotifyEmbedController {
  loadEntity: (uri: string) => void;
  play: () => void;
  resume: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (
    event: string,
    listener: (event: SpotifyPlaybackEvent) => void,
  ) => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: number; height: number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let spotifyApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (spotifyApiPromise) return spotifyApiPromise;
  spotifyApiPromise = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = resolve;
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-spotify-iframe-api]",
    );
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    script.dataset.spotifyIframeApi = "true";
    script.onerror = () => reject(new Error("Unable to load Spotify player"));
    document.body.appendChild(script);
  });
  return spotifyApiPromise;
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
  const spotifyHostRef = useRef<HTMLDivElement | null>(null);
  const spotifyControllerRef = useRef<SpotifyEmbedController | null>(null);
  const spotifyControllerPromiseRef =
    useRef<Promise<SpotifyEmbedController> | null>(null);
  const spotifyUriRef = useRef<string | null>(null);
  const itemRef = useRef<PlaybackItem | null>(null);
  const loggedItemRef = useRef<string | null>(null);
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
    };
  }, []);

  const getSpotifyController = useCallback(async (uri: string) => {
    if (spotifyControllerRef.current) {
      if (spotifyUriRef.current !== uri) {
        spotifyControllerRef.current.loadEntity(uri);
        spotifyUriRef.current = uri;
      }
      return spotifyControllerRef.current;
    }
    if (spotifyControllerPromiseRef.current)
      return spotifyControllerPromiseRef.current;

    spotifyControllerPromiseRef.current = (async () => {
      const api = await loadSpotifyIframeApi();
      const host = spotifyHostRef.current;
      if (!host) throw new Error("Spotify player host is unavailable");
      return new Promise<SpotifyEmbedController>((resolve) => {
        api.createController(
          host,
          { uri, width: 300, height: 80 },
          (controller) => {
            spotifyControllerRef.current = controller;
            spotifyUriRef.current = uri;
            controller.addListener("playback_started", () =>
              setPlayState("playing"),
            );
            controller.addListener("playback_update", (event) => {
              setCurrentTime(event.data.position / 1000);
              setDuration(event.data.duration / 1000);
              setPlayState(
                event.data.isBuffering
                  ? "loading"
                  : event.data.isPaused
                    ? "paused"
                    : "playing",
              );
            });
            resolve(controller);
          },
        );
      });
    })().catch((error) => {
      spotifyControllerPromiseRef.current = null;
      throw error;
    });
    return spotifyControllerPromiseRef.current;
  }, []);

  useEffect(() => () => spotifyControllerRef.current?.destroy(), []);

  const select = useCallback((next: PlaybackItem) => {
    if (itemRef.current?.id === next.id && itemRef.current.src === next.src)
      return;
    const audio = audioRef.current;
    if (itemRef.current?.engine === "spotify")
      spotifyControllerRef.current?.pause();
    else audio?.pause();
    itemRef.current = next;
    setItem(next);
    setCurrentTime(0);
    setDuration(next.duration || 0);
    setPlayState("loading");
    if ((next.engine ?? "audio") === "audio" && audio) {
      audio.src = next.src;
      audio.load();
    }
    setPlayState("paused");
  }, []);

  const play = useCallback(
    async (next?: PlaybackItem) => {
      const isSameItem =
        !next ||
        (itemRef.current?.id === next.id && itemRef.current.src === next.src);
      if (next) select(next);
      const audio = audioRef.current;
      const activeItem = next ?? itemRef.current;
      if (!activeItem) return;
      if (
        activeItem.trackActivity !== false &&
        loggedItemRef.current !== activeItem.id
      ) {
        loggedItemRef.current = activeItem.id;
        void recordTrackListen(activeItem.id).catch(() => {
          loggedItemRef.current = null;
        });
      }
      try {
        if (activeItem.engine === "spotify") {
          const controller = await getSpotifyController(activeItem.src);
          if (isSameItem && spotifyUriRef.current === activeItem.src) {
            controller.resume();
          } else {
            controller.play();
          }
          return;
        }
        if (!audio) return;
        await audio.play();
        setPlayState("playing");
      } catch {
        setPlayState("error");
      }
    },
    [getSpotifyController, select],
  );

  const pause = useCallback(() => {
    if (itemRef.current?.engine === "spotify")
      spotifyControllerRef.current?.pause();
    else audioRef.current?.pause();
    setPlayState("paused");
  }, []);

  const toggle = useCallback(
    async (next?: PlaybackItem) => {
      const isSame =
        !next ||
        (itemRef.current?.id === next.id && itemRef.current.src === next.src);
      if (isSame && playState === "playing") pause();
      else await play(next);
    },
    [pause, play, playState],
  );

  const seek = useCallback((time: number) => {
    if (itemRef.current?.engine === "spotify") {
      spotifyControllerRef.current?.seek(time);
      setCurrentTime(time);
      return;
    }
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

  const value = useMemo(
    () => ({
      item,
      playState,
      currentTime,
      duration,
      volume: volumeState,
      select,
      play,
      pause,
      toggle,
      seek,
      setVolume,
    }),
    [
      item,
      playState,
      currentTime,
      duration,
      volumeState,
      select,
      play,
      pause,
      toggle,
      seek,
      setVolume,
    ],
  );
  return (
    <PlaybackContext.Provider value={value}>
      {children}
      <div
        ref={spotifyHostRef}
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
