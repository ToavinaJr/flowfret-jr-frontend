import {
  PLAYBACK_LOGOUT_EVENT,
  clearPlaybackSession,
  readPlaybackSession,
  writePlaybackSession,
  type PlaybackSession,
} from "./playbackSession";

const item = {
  id: "track-1",
  src: "https://cdn.example.test/track.mp3",
  engine: "audio" as const,
  title: "Track",
  subtitle: "Artist",
};

describe("playbackSession", () => {
  beforeEach(() => localStorage.clear());

  it("restores the queue and player preferences", () => {
    const session: PlaybackSession = {
      item,
      queue: [item],
      currentIndex: 0,
      currentTime: 42,
      volume: 0.6,
      shuffle: true,
      repeatMode: "off",
    };

    writePlaybackSession(session);

    expect(readPlaybackSession()).toEqual(session);
  });

  it("does not persist temporary blob sources", () => {
    writePlaybackSession({
      item: { ...item, src: "blob:temporary", revokeSourceOnRelease: true },
      queue: [],
      currentIndex: -1,
      currentTime: 0,
      volume: 1,
      shuffle: false,
      repeatMode: "off",
    });

    expect(readPlaybackSession()).toBeUndefined();
  });

  it("ignores a corrupted session", () => {
    localStorage.setItem("fretflow.playback.session.v1", "not-json");

    expect(readPlaybackSession()).toBeUndefined();
  });

  it("clears persisted playback and notifies the active player on logout", () => {
    const onLogout = vi.fn();
    window.addEventListener(PLAYBACK_LOGOUT_EVENT, onLogout);
    writePlaybackSession({
      item,
      queue: [item],
      currentIndex: 0,
      currentTime: 12,
      volume: 1,
      shuffle: false,
      repeatMode: "off",
    });

    clearPlaybackSession();

    expect(readPlaybackSession()).toBeUndefined();
    expect(onLogout).toHaveBeenCalledOnce();
    window.removeEventListener(PLAYBACK_LOGOUT_EVENT, onLogout);
  });
});
