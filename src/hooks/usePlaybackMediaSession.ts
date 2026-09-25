import { useEffect, useRef } from "react";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { PlayState } from "@/types/song";

interface PlaybackMediaSessionOptions {
  item: PlaybackItem | null;
  playState: PlayState;
  currentTime: number;
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (time: number) => void;
}

export function usePlaybackMediaSession({
  item,
  playState,
  currentTime,
  duration,
  play,
  pause,
  next,
  previous,
  seek,
}: PlaybackMediaSessionOptions) {
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = item
      ? new MediaMetadata({
          title: item.title,
          artist: item.artist || item.subtitle,
          album: item.album || "FlowFret",
          artwork: item.imageUrl ? [{ src: item.imageUrl }] : undefined,
        })
      : null;
    navigator.mediaSession.playbackState =
      playState === "playing" ? "playing" : item ? "paused" : "none";
  }, [item, playState]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const handlers: Array<
      [MediaSessionAction, MediaSessionActionHandler | null]
    > = [
      ["play", () => void play()],
      ["pause", pause],
      ["previoustrack", () => void previous()],
      ["nexttrack", () => void next()],
      [
        "seekbackward",
        (details) => seek(currentTimeRef.current - (details.seekOffset || 10)),
      ],
      [
        "seekforward",
        (details) => seek(currentTimeRef.current + (details.seekOffset || 10)),
      ],
      [
        "seekto",
        (details) => details.seekTime !== undefined && seek(details.seekTime),
      ],
    ];
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Some browsers expose Media Session but not every action.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // Ignore unsupported actions during cleanup.
        }
      }
    };
  }, [next, pause, play, previous, seek]);

  useEffect(() => {
    if (
      !("mediaSession" in navigator) ||
      !duration ||
      !Number.isFinite(duration)
    )
      return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.min(currentTime, duration),
      });
    } catch {
      // Position state support differs across browsers and providers.
    }
  }, [currentTime, duration]);
}
