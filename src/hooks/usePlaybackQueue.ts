import { useCallback, useRef, useState } from "react";
import type { PlaybackItem } from "@/contexts/PlaybackContext";

interface InitialPlaybackQueue {
  queue: PlaybackItem[];
  currentIndex: number;
  shuffle: boolean;
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

  const setQueue = useCallback((items: PlaybackItem[], startIndex = 0) => {
    const safeIndex = items.length
      ? Math.max(0, Math.min(startIndex, items.length - 1))
      : -1;
    setQueueState(items);
    setCurrentIndex(safeIndex);
    historyRef.current = [];
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
      return [item];
    });
  }, []);

  const next = useCallback(() => {
    if (!queue.length) return null;
    let index: number;
    if (shuffle && queue.length > 1) {
      const candidates = queue.map((_, value) => value).filter(
        (value) => value !== currentIndex,
      );
      index = candidates[Math.floor(Math.random() * candidates.length)];
      if (currentIndex >= 0) historyRef.current.push(currentIndex);
    } else {
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
