import { useCallback, useRef } from "react";

export function useYouTubeController() {
  const hostRef = useRef<HTMLIFrameElement | null>(null);
  const videoIdRef = useRef<string | null>(null);

  const play = useCallback((videoId: string) => {
    const host = hostRef.current;
    if (!host) throw new Error("YouTube player host is unavailable");
    if (videoIdRef.current !== videoId) {
      videoIdRef.current = videoId;
      host.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&enablejsapi=1&playsinline=1`;
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

  return { hostRef, play, pause, seek };
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
