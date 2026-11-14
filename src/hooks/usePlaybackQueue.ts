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

  const appendAndSelectNext = useCallback((items: PlaybackItem[]) => {
    if (!items.length) return null;
    const nextIndex = queue.length;
    setQueueState((current) => [...current, ...items]);
    setCurrentIndex(nextIndex);
    return items[0];
  }, [queue.length]);

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

  const removeItem = useCallback((index: number) => {
    if (index < 0 || index >= queue.length) return;
    const nextQueue = queue.filter((_, itemIndex) => itemIndex !== index);
    setQueueState(nextQueue);
    setCurrentIndex((current) => {
      if (!nextQueue.length) return -1;
      if (index < current) return current - 1;
      if (index === current) return Math.min(current, nextQueue.length - 1);
      return current;
    });
  }, [queue]);

  const moveItem = useCallback((from: number, to: number) => {
    if (from < 0 || from >= queue.length || to < 0 || to >= queue.length || from === to) return;
    const nextQueue = [...queue];
    const [moved] = nextQueue.splice(from, 1);
    nextQueue.splice(to, 0, moved);
    setQueueState(nextQueue);
    setCurrentIndex((current) => current === from ? to : from < current && to >= current ? current - 1 : from > current && to <= current ? current + 1 : current);
  }, [queue]);

  return {
    queue,
    currentIndex,
    shuffle,
    setShuffle,
    setQueue,
    appendAndSelectNext,
    removeItem,
    moveItem,
    syncSelection,
    next,
    previous,
  };
}
