import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { VocalRemovalControl } from "./VocalRemovalControl";

const playback = vi.hoisted(() => ({
  item: { id: "1", provider: "YOUTUBE", providerTrackId: "video", title: "Track" },
  vocalRemoval: 0, stemStatus: "idle", stemProgress: 0,
  stemPhase: null as "queue" | "download" | "separation" | "finalizing" | null,
  prepareStems: vi.fn(), setVocalRemoval: vi.fn(),
}));
vi.mock("@/contexts/usePlayback", () => ({ usePlayback: () => playback }));

function open() {
  render(<I18nextProvider i18n={i18n}><VocalRemovalControl /></I18nextProvider>);
  fireEvent.click(screen.getByRole("button", { name: /Equalizer:/ }));
}

describe("progressive vocal removal control", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    playback.stemStatus = "idle";
    playback.stemPhase = null;
    playback.item.provider = "YOUTUBE";
    vi.clearAllMocks();
  });
  it("prepares on explicit request and disables the slider until ready", () => {
    open();
    expect(screen.getByRole("slider")).toBeDisabled();
    expect(playback.prepareStems).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Prepare tracks" }));
    expect(playback.prepareStems).toHaveBeenCalledOnce();
  });
  it("sends a fractional gain reduction from the accessible slider", () => {
    playback.stemStatus = "ready";
    open();
    const slider = screen.getByRole("slider", { name: /Vocal removal/ });
    fireEvent.change(slider, { target: { value: "75" } });
    expect(playback.setVocalRemoval).toHaveBeenCalledWith(0.75);
  });
  it("shows an indeterminate animated bar and the current phase when progress is unavailable", () => {
    playback.stemStatus = "preparing";
    playback.stemPhase = "separation";
    open();
    expect(screen.getByText(/Separating vocals/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });
  it("offers retry and explains a failed audio source", () => {
    playback.stemStatus = "failed";
    open();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(playback.prepareStems).toHaveBeenCalledOnce();
  });
  it("does not offer preparation for Spotify", () => {
    playback.item.provider = "SPOTIFY";
    open();
    expect(screen.getByText(/Spotify and local files/)).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });
});
