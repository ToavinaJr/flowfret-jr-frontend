import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { PlayState } from "@/types/song";

interface YouTubeControllerOptions {
  setPlayState: (state: PlayState) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  onEnded: () => void;
}

export function useYouTubeController({
  setPlayState,
  setCurrentTime,
  setDuration,
  onEnded,
}: YouTubeControllerOptions) {
  const hostRef = useRef<HTMLIFrameElement | null>(null);
  const videoIdRef = useRef<string | null>(null);
  const lastPlayerStateRef = useRef<number | null>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      const host = hostRef.current;
      if (
        event.origin !== "https://www.youtube.com" ||
        !host?.contentWindow ||
        event.source !== host.contentWindow
      )
        return;
      const message = parseMessage(event.data);
      if (message?.event !== "infoDelivery" || !message.info) return;
      const { currentTime, duration, playerState } = message.info;
      if (typeof currentTime === "number") setCurrentTime(currentTime);
      if (typeof duration === "number" && duration > 0) setDuration(duration);
      if (typeof playerState !== "number") return;
      setPlayState(mapPlayerState(playerState));
      if (playerState === 0 && lastPlayerStateRef.current !== 0) onEnded();
      lastPlayerStateRef.current = playerState;
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [onEnded, setCurrentTime, setDuration, setPlayState]);

  const play = useCallback((videoId: string) => {
    const host = hostRef.current;
    if (!host) throw new Error("YouTube player host is unavailable");
    if (videoIdRef.current !== videoId) {
      videoIdRef.current = videoId;
      lastPlayerStateRef.current = null;
      host.onload = () => listen(host);
      const origin = encodeURIComponent(window.location.origin);
      host.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&enablejsapi=1&playsinline=1&origin=${origin}`;
      return;
    }
    command(host, "playVideo");
  }, []);

  const pause = useCallback(() => {
    if (hostRef.current) command(hostRef.current, "pauseVideo");
  }, []);

  const seek = useCallback((seconds: number) => {
    if (hostRef.current)
      command(hostRef.current, "seekTo", [Math.max(0, seconds), true]);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (hostRef.current)
      command(hostRef.current, "setVolume", [
        Math.round(Math.max(0, Math.min(1, volume)) * 100),
      ]);
  }, []);

  return {
    hostRef: hostRef as RefObject<HTMLIFrameElement>,
    play,
    pause,
    seek,
    setVolume,
  };
}

interface YouTubeMessage {
  event?: string;
  info?: { currentTime?: number; duration?: number; playerState?: number };
}

function parseMessage(value: unknown): YouTubeMessage | null {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object"
      ? (parsed as YouTubeMessage)
      : null;
  } catch {
    return null;
  }
}

function mapPlayerState(state: number): PlayState {
  if (state === 1) return "playing";
  if (state === 3) return "loading";
  if (state === 2 || state === 0 || state === 5) return "paused";
  return "idle";
}

function listen(frame: HTMLIFrameElement) {
  frame.contentWindow?.postMessage(
    JSON.stringify({ event: "listening", id: "flowfret-player" }),
    "https://www.youtube.com",
  );
}

function command(
  frame: HTMLIFrameElement,
  func: string,
  args: unknown[] = [],
) {
  frame.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args }),
    "https://www.youtube.com",
  );
}
