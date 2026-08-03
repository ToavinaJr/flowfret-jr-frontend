import type { AudioOwner } from "@/types/audio";

const stopHandlers = new Map<AudioOwner, () => void>();
let currentOwner: AudioOwner | null = null;

export function registerAudioOwner(
  owner: AudioOwner,
  stop: () => void,
): () => void {
  stopHandlers.set(owner, stop);
  return () => {
    stopHandlers.delete(owner);
    if (currentOwner === owner) {
      currentOwner = null;
    }
  };
}

export function requestAudioOwner(owner: AudioOwner): void {
  if (currentOwner && currentOwner !== owner) {
    const stopPrev = stopHandlers.get(currentOwner);
    if (stopPrev) {
      stopPrev();
    }
  }
  currentOwner = owner;
}

export function releaseAudioOwner(owner: AudioOwner): void {
  if (currentOwner === owner) {
    currentOwner = null;
  }
}
