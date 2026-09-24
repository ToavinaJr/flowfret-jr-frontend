import { useEffect } from "react";
import type { PlayState } from "@/types/song";

const PLAYBACK_CLAIM_KEY = "fretflow.playback.claim.v1";
let tabId: string | undefined;
let channel: BroadcastChannel | null | undefined;

export function usePlaybackTabCoordination(
  playState: PlayState,
  pause: () => void,
) {
  useEffect(() => {
    if (playState !== "playing") return;
    const currentTabId = getPlaybackTabId();
    try {
      localStorage.setItem(
        PLAYBACK_CLAIM_KEY,
        JSON.stringify({ tabId: currentTabId, claimedAt: Date.now() }),
      );
    } catch {
      // BroadcastChannel still coordinates tabs when storage is unavailable.
    }
    playbackChannel()?.postMessage({ type: "claim", tabId: currentTabId });
  }, [playState]);

  useEffect(() => {
    const currentTabId = getPlaybackTabId();
    const activeChannel = playbackChannel();
    const handleClaim = (claimedBy: string | undefined) => {
      if (claimedBy && claimedBy !== currentTabId) pause();
    };
    const handleMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; tabId?: string } | null;
      if (data?.type === "claim") handleClaim(data.tabId);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PLAYBACK_CLAIM_KEY || !event.newValue) return;
      try {
        handleClaim((JSON.parse(event.newValue) as { tabId?: string }).tabId);
      } catch {
        // Ignore malformed cross-tab messages.
      }
    };
    activeChannel?.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      activeChannel?.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [pause]);
}

function getPlaybackTabId() {
  if (!tabId)
    tabId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36);
  return tabId;
}

function playbackChannel() {
  if (channel !== undefined) return channel;
  channel =
    typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel("fretflow.playback.v1");
  return channel;
}
