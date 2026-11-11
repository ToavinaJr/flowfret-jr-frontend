import { useCallback, useRef, useState } from "react";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { RepeatMode } from "@/services/playbackSession";

interface InitialPlaybackQueue {
  queue: PlaybackItem[];
  currentIndex: number;
  shuffle: boolean;
  repeatMode?: RepeatMode;
}

export function usePlaybackQueue(initial?: InitialPlaybackQueue) {
  const [queue, setQueueState] = useState<PlaybackItem[]>(
    () => initial?.queue ?? [],
  );
  const [currentIndex, setCurrentIndex] = useState(
    () => initial?.currentIndex ?? -1,
  );
  const [shuffle, setShuffle] = useState(() => initial?.shuffle ?? false);
  const historyRef = useRef<number[]>([]);
  const playedInShuffleCycleRef = useRef<number[]>(
    initial?.queue?.length && initial.currentIndex >= 0
      ? [initial.currentIndex]
      : [],
  );

  const setQueue = useCallback((items: PlaybackItem[], startIndex = 0) => {
    const safeIndex = items.length
      ? Math.max(0, Math.min(startIndex, items.length - 1))
      : -1;
    setQueueState(items);
    setCurrentIndex(safeIndex);
    historyRef.current = [];
    playedInShuffleCycleRef.current = safeIndex >= 0 ? [safeIndex] : [];
    return safeIndex >= 0 ? items[safeIndex] : null;
  }, []);

  const syncSelection = useCallback((item: PlaybackItem) => {
    setQueueState((current) => {
      const index = current.findIndex(
        (candidate) =>
          candidate.id === item.id && candidate.src === item.src,
      );
      if (index >= 0) {
        setCurrentIndex(index);
        return current;
      }
      setCurrentIndex(0);
      historyRef.current = [];
      playedInShuffleCycleRef.current = [0];
      return [item];
    });
  }, []);

  const next = useCallback((repeatMode: RepeatMode = "off") => {
    if (!queue.length) return null;
    let index: number;
    if (shuffle && queue.length > 1) {
      const candidates = queue
        .map((_, value) => value)
        .filter((value) => !playedInShuffleCycleRef.current.includes(value));
      if (!candidates.length && repeatMode !== "queue") return null;
      if (!candidates.length) {
        playedInShuffleCycleRef.current = [currentIndex];
        candidates.push(...queue.map((_, value) => value).filter((value) => value !== currentIndex));
      }
      index = candidates[Math.floor(Math.random() * candidates.length)];
      if (currentIndex >= 0) historyRef.current.push(currentIndex);
      playedInShuffleCycleRef.current.push(index);
    } else {
      if (currentIndex >= queue.length - 1 && repeatMode !== "queue") return null;
      index = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
    }
    setCurrentIndex(index);
    return queue[index];
  }, [currentIndex, queue, shuffle]);

  const previous = useCallback(() => {
    if (!queue.length) return null;
    const historic = shuffle ? historyRef.current.pop() : undefined;
    const index =
      historic ?? (currentIndex > 0 ? currentIndex - 1 : queue.length - 1);
    setCurrentIndex(index);
    return queue[index];
  }, [currentIndex, queue, shuffle]);

  return {
    queue,
    currentIndex,
    shuffle,
    setShuffle,
    setQueue,
    syncSelection,
    next,
    previous,
  };
}
