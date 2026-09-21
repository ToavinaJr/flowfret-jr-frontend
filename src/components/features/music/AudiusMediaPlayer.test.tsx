import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";

const mocks = vi.hoisted(() => ({ prepare: vi.fn(), retry: vi.fn() }));
vi.mock("@/hooks/useTranscriptionEvents", () => ({
  useTranscriptionEvents: () => ({
    transcription: null,
    error: null,
    prepare: mocks.prepare,
    retry: mocks.retry,
  }),
}));

const track = {
  provider: "AUDIUS" as const,
  id: "track",
  audiusId: "track",
  title: "Song",
  artists: [{ id: "artist", name: "Artist" }],
  imageUrl: null,
  audiusUrl: "https://audius.co/artist/song",
  externalUrl: "https://audius.co/artist/song",
  album: null,
  isrc: null,
  streamUrl: "https://audio.audius.co/song.mp3",
  genre: "Rock",
  geniusUrl: null,
  geniusMatchScore: null,
  durationMs: 120000,
};

describe("AudiusMediaPlayer transcription", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("fr");
    mocks.prepare.mockReset();
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "pause", {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLMediaElement.prototype, "load", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("starts audio and transcribes the selected Audius source", async () => {
    mocks.prepare.mockReturnValue(new Promise(() => undefined));
    render(
      <I18nextProvider i18n={i18n}>
        <PlaybackProvider>
          <AudiusMediaPlayer track={track} />
        </PlaybackProvider>
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Lire Song" }));
    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalled(),
    );
    expect(mocks.prepare).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Transcription de Song")).toBeInTheDocument();
  });
});
