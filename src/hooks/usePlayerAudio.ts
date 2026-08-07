import { useMemo } from "react";
import { usePlayback, type PlaybackItem } from "@/contexts/PlaybackContext";

interface UsePlayerAudioOptions {
  src: string | null;
  title?: string;
  subtitle?: string;
}

export function usePlayerAudio({ src, title = "Guitar Player", subtitle = "Accompagnement guitare" }: UsePlayerAudioOptions) {
  const playback = usePlayback();
  const item = useMemo<PlaybackItem | null>(() => src ? ({ id: `guitar:${src}`, src, title, subtitle, destination: "/player" }) : null, [src, title, subtitle]);

  const isActive = playback.item?.id === item?.id;
  return {
    playState: isActive ? playback.playState : "idle" as const,
    currentTime: isActive ? playback.currentTime : 0,
    duration: isActive ? playback.duration : 0,
    play: () => playback.play(item || undefined),
    pause: playback.pause,
    seek: playback.seek,
    toggle: () => playback.toggle(item || undefined),
  };
}
