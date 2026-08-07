import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";

const mocks = vi.hoisted(() => ({ prepare: vi.fn(), retry: vi.fn() }));
vi.mock("@/hooks/useTranscriptionEvents", () => ({
  useTranscriptionEvents: () => ({ transcription: null, error: null, prepare: mocks.prepare, retry: mocks.retry }),
}));

const track = { audiusId: "track", title: "Song", artists: [{ id: "artist", name: "Artist" }], imageUrl: null, audiusUrl: "https://audius.co/artist/song", streamUrl: "https://audio.audius.co/song.mp3", genre: "Rock", geniusUrl: null, geniusMatchScore: null, durationMs: 120000 };

describe("AudiusMediaPlayer preparation", () => {
  beforeEach(() => { mocks.prepare.mockReset(); Object.defineProperty(HTMLMediaElement.prototype, "play", { configurable: true, value: vi.fn().mockResolvedValue(undefined) }); });
  it("starts audio while synchronized lyrics are being prepared", async () => {
    mocks.prepare.mockReturnValue(new Promise(() => undefined));
    render(<AudiusMediaPlayer track={track} />);
    fireEvent.click(screen.getByRole("button", { name: "Lecture" }));
    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled(),
    );
  });
});
