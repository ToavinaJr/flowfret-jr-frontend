import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { LyricsLinesEditor } from "./LyricsLinesEditor";

describe("LyricsLinesEditor live synchronization", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("captures a selected line's start and end from the current playback position", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <I18nextProvider i18n={i18n}>
        <LyricsLinesEditor
          lines={[{ startTimeMs: null, text: "First line" }]}
          onChange={onChange}
          liveSync={{ currentTimeMs: 12_345, isPlaying: true, onTogglePlayback: vi.fn() }}
        />
      </I18nextProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Select line 1 to synchronize" }));
    fireEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(onChange).toHaveBeenLastCalledWith([{ startTimeMs: 12_345, endTimeMs: null, text: "First line" }]);

    rerender(
      <I18nextProvider i18n={i18n}>
        <LyricsLinesEditor
          lines={[{ startTimeMs: 12_345, endTimeMs: null, text: "First line" }]}
          onChange={onChange}
          liveSync={{ currentTimeMs: 12_345, isPlaying: true, onTogglePlayback: vi.fn() }}
        />
      </I18nextProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "End" }));
    expect(onChange).toHaveBeenLastCalledWith([{ startTimeMs: 12_345, endTimeMs: 12_345, text: "First line" }]);
  });
});
