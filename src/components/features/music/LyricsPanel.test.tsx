import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { LyricsPanel } from "./LyricsPanel";

const renderPanel = (props: Partial<Parameters<typeof LyricsPanel>[0]> = {}) => render(
  <I18nextProvider i18n={i18n}>
    <LyricsPanel lyrics={null} status="not-found" currentTime={0} {...props} />
  </I18nextProvider>,
);

describe("LyricsPanel", () => {
  it("renders loading, unavailable and instrumental states", () => {
    const { rerender } = renderPanel({ status: "loading" });
    expect(screen.getByText(/chargement|loading/i)).toBeInTheDocument();
    rerender(<I18nextProvider i18n={i18n}><LyricsPanel lyrics={null} status="not-found" currentTime={0} /></I18nextProvider>);
    expect(screen.getByText(/indisponibles|unavailable/i)).toBeInTheDocument();
    rerender(<I18nextProvider i18n={i18n}><LyricsPanel lyrics={{ provider: "lrclib", synced: false, instrumental: true, lines: [] }} status="success" currentTime={0} /></I18nextProvider>);
    expect(screen.getByText(/instrumental/i)).toBeInTheDocument();
  });

  it("shows plain lyrics", () => {
    renderPanel({ status: "success", lyrics: { provider: "lrclib", synced: false, instrumental: false, plainLyrics: "Plain line", lines: [] } });
    expect(screen.getByText("Plain line")).toBeInTheDocument();
  });

  it("highlights the active synchronized line and seeks", () => {
    const onSeek = vi.fn();
    renderPanel({ status: "success", currentTime: 3, onSeek, lyrics: { provider: "lrclib", synced: true, instrumental: false, lines: [{ startTimeMs: 1000, text: "First" }, { startTimeMs: 3000, text: "Second" }] } });
    expect(screen.getByRole("button", { name: "Second" }).className).toContain("font-semibold");
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(onSeek).toHaveBeenCalledWith(1);
  });
});
