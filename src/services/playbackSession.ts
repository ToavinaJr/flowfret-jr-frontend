import type { PlaybackItem } from "@/contexts/PlaybackContext";

const SESSION_KEY = "fretflow.playback.session.v1";
export const PLAYBACK_LOGOUT_EVENT = "fretflow:playback-logout";
const MAX_QUEUE_LENGTH = 250;

export interface PlaybackSession {
  item: PlaybackItem | null;
  queue: PlaybackItem[];
  currentIndex: number;
  currentTime: number;
  volume: number;
  shuffle: boolean;
}

function isPlaybackItem(value: unknown): value is PlaybackItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PlaybackItem>;
  return (
    typeof item.id === "string" &&
    typeof item.src === "string" &&
    typeof item.title === "string" &&
    typeof item.subtitle === "string" &&
    (item.engine === undefined ||
      item.engine === "audio" ||
      item.engine === "spotify" ||
      item.engine === "youtube")
  );
}

function isPersistable(item: PlaybackItem) {
  return !item.revokeSourceOnRelease && !item.src.startsWith("blob:");
}

export function readPlaybackSession(): PlaybackSession | undefined {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return undefined;
    const value = JSON.parse(raw) as Partial<PlaybackSession>;
    const queue = Array.isArray(value.queue)
      ? value.queue
          .filter(isPlaybackItem)
          .filter(isPersistable)
          .slice(0, MAX_QUEUE_LENGTH)
      : [];
    const item = isPlaybackItem(value.item) && isPersistable(value.item)
      ? value.item
      : null;
    const matchingIndex = item
      ? queue.findIndex(
          (candidate) => candidate.id === item.id && candidate.src === item.src,
        )
      : -1;
    const requestedIndex = Number.isInteger(value.currentIndex)
      ? Number(value.currentIndex)
      : matchingIndex;
    const currentIndex = queue.length
      ? Math.max(0, Math.min(requestedIndex, queue.length - 1))
      : -1;
    return {
      item,
      queue,
      currentIndex,
      currentTime: Math.max(0, Number(value.currentTime) || 0),
      volume:
        typeof value.volume === "number" && Number.isFinite(value.volume)
          ? Math.max(0, Math.min(1, value.volume))
          : 1,
      shuffle: value.shuffle === true,
    };
  } catch {
    return undefined;
  }
}

export function writePlaybackSession(session: PlaybackSession) {
  try {
    if (session.item && !isPersistable(session.item)) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        ...session,
        queue: session.queue.filter(isPersistable).slice(0, MAX_QUEUE_LENGTH),
      }),
    );
  } catch {
    // Playback must keep working when storage is unavailable or full.
  }
}

export function clearPlaybackSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Logout must continue when storage is unavailable.
  }
  window.dispatchEvent(new Event(PLAYBACK_LOGOUT_EVENT));
}
