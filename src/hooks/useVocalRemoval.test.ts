import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlaybackItem } from "@/contexts/playback-context";
import { useVocalRemoval } from "./useVocalRemoval";

const mocks = vi.hoisted(() => ({ create: vi.fn(), get: vi.fn(), unlock: vi.fn() }));
vi.mock("@/services/audioStemsApi", () => ({
  createAudioStems: mocks.create, getAudioStems: mocks.get, supportsVocalRemoval: () => true,
}));
vi.mock("@/utils/audioContext", () => ({ unlockAudioContext: mocks.unlock }));
const item: PlaybackItem = { id: "one", src: "video", title: "Track", subtitle: "Artist", provider: "YOUTUBE", providerTrackId: "video" };

describe("vocal preparation lifecycle", () => {
  afterEach(() => { vi.useRealTimers(); vi.clearAllMocks(); });

  it("polls DOWNLOADING and ignores a late result after changing tracks", async () => {
    vi.useFakeTimers();
    mocks.unlock.mockResolvedValue({});
    mocks.create.mockResolvedValue({ status: "DOWNLOADING", audioStemId: "one", progress: 0 });
    let resolve!: (value: object) => void;
    mocks.get.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const { result } = renderHook(() => useVocalRemoval(vi.fn()));
    let pending!: Promise<void>;
    await act(async () => { pending = result.current.prepare(item); });
    expect(result.current.status).toBe("preparing");
    expect(result.current.phase).toBe("download");
    await act(async () => { await vi.advanceTimersByTimeAsync(3000); });
    expect(mocks.get).toHaveBeenCalledOnce();
    act(() => result.current.reset());
    await act(async () => { resolve({ status: "FAILED" }); await pending; });
    expect(result.current.status).toBe("idle");
    expect(result.current.phase).toBeNull();
    expect(result.current.mixerRef.current).toBeNull();
  });

  it("deduplicates clicks and aborts polling on unmount", async () => {
    vi.useFakeTimers();
    mocks.unlock.mockResolvedValue({});
    mocks.create.mockResolvedValue({ status: "PENDING", audioStemId: "one", progress: 0 });
    const { result, unmount } = renderHook(() => useVocalRemoval(vi.fn()));
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.prepare(item);
      await result.current.prepare(item);
    });
    expect(mocks.create).toHaveBeenCalledOnce();
    unmount();
    await pending;
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("allows a new attempt after a failed request", async () => {
    mocks.unlock.mockResolvedValue({});
    mocks.create.mockRejectedValue(new Error("STEMS_HTTP_503"));
    const { result } = renderHook(() => useVocalRemoval(vi.fn()));
    await act(async () => { await result.current.prepare(item); });
    expect(result.current.status).toBe("failed");
    await act(async () => { await result.current.prepare(item); });
    expect(mocks.create).toHaveBeenCalledTimes(2);
  });
});
