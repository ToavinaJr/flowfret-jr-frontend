import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { FloatingPanelWindow } from "./FloatingPanelWindow";

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height });
}

function getBounds(element: HTMLElement) {
  return {
    left: Number.parseFloat(element.style.left),
    top: Number.parseFloat(element.style.top),
    width: Number.parseFloat(element.style.width),
    height: Number.parseFloat(element.style.height),
  };
}

function windowElement(minimized = false) {
  return (
    <I18nextProvider i18n={i18n}>
      <FloatingPanelWindow
        windowId="lyrics"
        title="Lyrics"
        zIndex={1}
        minimized={minimized}
        onClose={vi.fn()}
        onFocus={vi.fn()}
        onMinimize={vi.fn()}
      >
        <p>Window content</p>
      </FloatingPanelWindow>
    </I18nextProvider>,
  );
}

function renderWindow(minimized = false) {
  return render(windowElement(minimized));
}

describe("FloatingPanelWindow viewport bounds", () => {
  beforeEach(() => {
    localStorage.clear();
    setViewport(1280, 800);
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("constrains saved dimensions to a narrow mobile viewport", () => {
    setViewport(320, 240);
    localStorage.setItem(
      "flowfret.media-window.lyrics.v1",
      JSON.stringify({ x: -400, y: -400, width: 1200, height: 900 }),
    );

    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Lyrics" });
    const bounds = getBounds(dialog);

    expect(bounds.width).toBeLessThanOrEqual(window.innerWidth);
    expect(bounds.height).toBeLessThanOrEqual(window.innerHeight);
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.left + bounds.width).toBeLessThanOrEqual(window.innerWidth);
    expect(bounds.top + bounds.height).toBeLessThanOrEqual(window.innerHeight);
  });

  it("keeps the window inside the viewport after resize and dragging", () => {
    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Lyrics" });
    setViewport(360, 280);
    fireEvent(window, new Event("resize"));
    fireEvent.pointerDown(dialog, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerMove(dialog, { pointerId: 1, clientX: 2000, clientY: 2000 });
    fireEvent.pointerUp(dialog, { pointerId: 1 });

    const bounds = getBounds(dialog);
    expect(bounds.width).toBeLessThanOrEqual(window.innerWidth);
    expect(bounds.height).toBeLessThanOrEqual(window.innerHeight);
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.left + bounds.width).toBeLessThanOrEqual(window.innerWidth);
    expect(bounds.top + bounds.height).toBeLessThanOrEqual(window.innerHeight);
  });

  it("limits keyboard resizing to the available viewport space", () => {
    setViewport(320, 240);
    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Lyrics" });
    const resizeButton = screen.getByRole("button", { name: "Resize window with pointer or arrow keys" });
    fireEvent.keyDown(resizeButton, { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(resizeButton, { key: "ArrowDown", shiftKey: true });

    const bounds = getBounds(dialog);
    expect(bounds.left + bounds.width).toBeLessThanOrEqual(window.innerWidth);
    expect(bounds.top + bounds.height).toBeLessThanOrEqual(window.innerHeight);
  });

  it("positions a minimized window by its collapsed height and clamps it again when restored", () => {
    setViewport(360, 700);
    localStorage.setItem(
      "flowfret.media-window.lyrics.v1",
      JSON.stringify({ x: 20, y: 500, width: 320, height: 440 }),
    );
    const rendered = renderWindow(true);
    const dialog = screen.getByRole("dialog", { name: "Lyrics" });
    fireEvent.pointerDown(dialog, { pointerId: 1, clientX: 25, clientY: 510 });
    fireEvent.pointerMove(dialog, { pointerId: 1, clientX: 25, clientY: 2000 });
    fireEvent.pointerUp(dialog, { pointerId: 1 });

    let bounds = getBounds(dialog);
    expect(Number.parseFloat(dialog.style.height)).toBe(54);
    expect(bounds.top + 54).toBeLessThanOrEqual(window.innerHeight);
    expect(bounds.top).toBeGreaterThan(100);

    rendered.rerender(windowElement(false));
    bounds = getBounds(dialog);
    expect(bounds.top + bounds.height).toBeLessThanOrEqual(window.innerHeight);
  });
});
