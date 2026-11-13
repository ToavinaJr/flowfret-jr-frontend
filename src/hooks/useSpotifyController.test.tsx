import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { SpotifyPlaybackEvent } from "@/services/spotifyIframe";
import { loadSpotifyIframeApi } from "@/services/spotifyIframe";
import { useSpotifyController } from "./useSpotifyController";

vi.mock("@/services/spotifyIframe", () => ({ loadSpotifyIframeApi: vi.fn() }));

it("reports a completed Spotify playback once, never a mid-song pause, and supports replay", async () => {
  const listeners = new Map<string, (event: SpotifyPlaybackEvent) => void>();
  vi.mocked(loadSpotifyIframeApi).mockResolvedValue({
    createController: (_element, _options, callback) => callback({
      loadEntity: vi.fn(), play: vi.fn(), resume: vi.fn(), pause: vi.fn(), seek: vi.fn(), destroy: vi.fn(),
      addListener: (name, listener) => { listeners.set(name, listener); },
    }),
  });
  const onEnded = vi.fn();
  const { result } = renderHook(() => useSpotifyController({ setPlayState: vi.fn(), setCurrentTime: vi.fn(), setDuration: vi.fn(), onEnded }));
  Object.defineProperty(result.current.hostRef, "current", { value: document.createElement("div"), writable: true });
  await act(async () => { await result.current.getController("spotify:track:one"); });
  const update = (position: number, isPaused = true) => act(() => {
    listeners.get("playback_update")?.({ data: { position, duration: 10000, isPaused, isBuffering: false } });
  });
  update(5000);
  expect(onEnded).not.toHaveBeenCalled();
  update(10000);
  update(10000);
  expect(onEnded).toHaveBeenCalledTimes(1);
  update(0, false);
  update(10000);
  expect(onEnded).toHaveBeenCalledTimes(2);
});
