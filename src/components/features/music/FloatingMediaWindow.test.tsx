import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { FloatingMediaWindow } from "./FloatingMediaWindow";

function renderWindow() {
  const onClose = vi.fn();
  const onFocus = vi.fn();
  const onMinimize = vi.fn();
  function Harness() {
    const [minimized, setMinimized] = useState(false);
    return (
      <I18nextProvider i18n={i18n}>
        <FloatingMediaWindow
          windowId="chords"
          title="Chord window"
          zIndex={60}
          minimized={minimized}
          onClose={onClose}
          onFocus={onFocus}
          onMinimize={() => { onMinimize(); setMinimized((current) => !current); }}
        >
          <p>Window content</p>
        </FloatingMediaWindow>
      </I18nextProvider>
    );
  }
  const view = render(<Harness />);
  return { ...view, onClose, onFocus, onMinimize };
}

describe("FloatingMediaWindow", () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    Object.defineProperty(HTMLElement.prototype, "setPointerCapture", { configurable: true, value: vi.fn() });
  });

  it("moves by dragging the title bar and persists its new bounds", () => {
    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Chord window" });
    const header = screen.getByRole("heading", { name: "Chord window" }).parentElement;
    expect(header).not.toBeNull();
    const initialLeft = Number.parseInt(dialog.style.left, 10);
    const initialTop = Number.parseInt(dialog.style.top, 10);

    fireEvent.pointerDown(header!, { pointerId: 1, clientX: 30, clientY: 30 });
    fireEvent.pointerMove(dialog, { pointerId: 1, clientX: 70, clientY: 5 });
    fireEvent.pointerUp(dialog, { pointerId: 1 });

    expect(dialog).toHaveStyle({ left: `${initialLeft + 40}px`, top: `${initialTop - 25}px` });
    const saved = JSON.parse(localStorage.getItem("flowfret.media-window.chords.v1") ?? "{}");
    expect(saved).toMatchObject({ x: initialLeft + 40, y: initialTop - 25 });
  });

  it("allows dragging a window beyond every viewport edge", () => {
    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Chord window" });
    const header = screen.getByRole("heading", { name: "Chord window" }).parentElement!;

    fireEvent.pointerDown(header, { pointerId: 3, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(dialog, { pointerId: 3, clientX: -400, clientY: -400 });
    fireEvent.pointerUp(dialog, { pointerId: 3 });

    expect(Number.parseInt(dialog.style.left, 10)).toBeLessThan(0);
    expect(Number.parseInt(dialog.style.top, 10)).toBeLessThan(0);
  });

  it("starts moving from non-interactive content inside the window", () => {
    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Chord window" });
    const content = screen.getByText("Window content");
    const initialLeft = Number.parseInt(dialog.style.left, 10);
    const initialTop = Number.parseInt(dialog.style.top, 10);

    fireEvent.pointerDown(content, { pointerId: 4, clientX: 40, clientY: 40 });
    fireEvent.pointerMove(dialog, { pointerId: 4, clientX: 55, clientY: 52 });
    fireEvent.pointerUp(dialog, { pointerId: 4 });

    expect(dialog).toHaveStyle({ left: `${initialLeft + 15}px`, top: `${initialTop + 12}px` });
  });

  it.each([
    { edge: "top", deltaX: 0, deltaY: 20, widthChange: 0, heightChange: -20, xChange: 0, yChange: 20 },
    { edge: "right", deltaX: 20, deltaY: 0, widthChange: 20, heightChange: 0, xChange: 0, yChange: 0 },
    { edge: "bottom", deltaX: 0, deltaY: 20, widthChange: 0, heightChange: 20, xChange: 0, yChange: 0 },
    { edge: "left", deltaX: 20, deltaY: 0, widthChange: -20, heightChange: 0, xChange: 20, yChange: 0 },
  ])("resizes from the $edge edge while keeping the opposite edge fixed", ({ edge, deltaX, deltaY, widthChange, heightChange, xChange, yChange }) => {
    renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Chord window" });
    const handle = document.querySelector<HTMLButtonElement>(`[data-resize-edge="${edge}"]`);
    expect(handle).not.toBeNull();
    const initial = {
      left: Number.parseInt(dialog.style.left, 10),
      top: Number.parseInt(dialog.style.top, 10),
      width: Number.parseInt(dialog.style.width, 10),
      height: Number.parseInt(dialog.style.height, 10),
    };

    fireEvent.pointerDown(handle!, { pointerId: 5, clientX: 400, clientY: 400 });
    fireEvent.pointerMove(dialog, { pointerId: 5, clientX: 400 + deltaX, clientY: 400 + deltaY });
    fireEvent.pointerUp(dialog, { pointerId: 5 });

    expect(dialog).toHaveStyle({
      left: `${initial.left + xChange}px`,
      top: `${initial.top + yChange}px`,
      width: `${initial.width + widthChange}px`,
      height: `${initial.height + heightChange}px`,
    });
  });

  it("places desktop windows side by side inside the content area", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <FloatingMediaWindow windowId="chords" title="Chords" zIndex={60} minimized={false} onClose={vi.fn()} onFocus={vi.fn()} onMinimize={vi.fn()}>
          <p>Chord content</p>
        </FloatingMediaWindow>
        <FloatingMediaWindow windowId="lyrics" title="Lyrics" zIndex={61} minimized={false} onClose={vi.fn()} onFocus={vi.fn()} onMinimize={vi.fn()}>
          <p>Lyrics content</p>
        </FloatingMediaWindow>
      </I18nextProvider>,
    );

    const chords = screen.getByRole("dialog", { name: "Chords" });
    const lyrics = screen.getByRole("dialog", { name: "Lyrics" });
    const chordRight = Number.parseInt(chords.style.left, 10) + Number.parseInt(chords.style.width, 10);
    expect(Number.parseInt(chords.style.left, 10)).toBeGreaterThanOrEqual(288);
    expect(chordRight).toBeLessThanOrEqual(Number.parseInt(lyrics.style.left, 10));
  });

  it("sizes both windows to fit beside the desktop navigation at tablet width", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
    render(
      <I18nextProvider i18n={i18n}>
        <FloatingMediaWindow windowId="chords" title="Chords" zIndex={60} minimized={false} onClose={vi.fn()} onFocus={vi.fn()} onMinimize={vi.fn()}>
          <p>Chord content</p>
        </FloatingMediaWindow>
        <FloatingMediaWindow windowId="lyrics" title="Lyrics" zIndex={61} minimized={false} onClose={vi.fn()} onFocus={vi.fn()} onMinimize={vi.fn()}>
          <p>Lyrics content</p>
        </FloatingMediaWindow>
      </I18nextProvider>,
    );

    const chords = screen.getByRole("dialog", { name: "Chords" });
    const lyrics = screen.getByRole("dialog", { name: "Lyrics" });
    const chordRight = Number.parseInt(chords.style.left, 10) + Number.parseInt(chords.style.width, 10);
    expect(Number.parseInt(chords.style.left, 10)).toBeGreaterThanOrEqual(256);
    expect(chordRight).toBeLessThanOrEqual(Number.parseInt(lyrics.style.left, 10));
    expect(Number.parseInt(lyrics.style.left, 10) + Number.parseInt(lyrics.style.width, 10)).toBeLessThanOrEqual(1024);
  });

  it("preserves saved off-screen positions when the viewport changes", () => {
    localStorage.setItem("flowfret.media-window.chords.v1", JSON.stringify({ x: 900, y: 900, width: 600, height: 500 }));
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 320 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 180 });

    renderWindow();

    const dialog = screen.getByRole("dialog", { name: "Chord window" });
    expect(Number.parseInt(dialog.style.left, 10)).toBe(900);
    expect(Number.parseInt(dialog.style.top, 10)).toBe(900);
    expect(Number.parseInt(dialog.style.width, 10)).toBeLessThanOrEqual(320);
    expect(Number.parseInt(dialog.style.height, 10)).toBeGreaterThan(0);
  });

  it("stacks both windows without overlap on a narrow viewport", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
    render(
      <I18nextProvider i18n={i18n}>
        <FloatingMediaWindow windowId="chords" title="Chords" zIndex={60} minimized={false} onClose={vi.fn()} onFocus={vi.fn()} onMinimize={vi.fn()}>
          <p>Chord content</p>
        </FloatingMediaWindow>
        <FloatingMediaWindow windowId="lyrics" title="Lyrics" zIndex={61} minimized={false} onClose={vi.fn()} onFocus={vi.fn()} onMinimize={vi.fn()}>
          <p>Lyrics content</p>
        </FloatingMediaWindow>
      </I18nextProvider>,
    );

    const chords = screen.getByRole("dialog", { name: "Chords" });
    const lyrics = screen.getByRole("dialog", { name: "Lyrics" });
    const chordBottom = Number.parseInt(chords.style.top, 10) + Number.parseInt(chords.style.height, 10);
    expect(Number.parseInt(lyrics.style.top, 10)).toBeGreaterThanOrEqual(chordBottom);
  });

  it("supports pointer and keyboard resizing, minimize, restore, and close", () => {
    const { onClose, onMinimize } = renderWindow();
    const dialog = screen.getByRole("dialog", { name: "Chord window" });
    const initialWidth = Number.parseInt(dialog.style.width, 10);
    const resizeButton = document.querySelector<HTMLButtonElement>('[data-resize-edge="corner"]');
    expect(resizeButton).not.toBeNull();

    fireEvent.pointerDown(resizeButton!, { pointerId: 2, clientX: 400, clientY: 500 });
    fireEvent.pointerMove(dialog, { pointerId: 2, clientX: 420, clientY: 520 });
    fireEvent.pointerUp(dialog, { pointerId: 2 });
    expect(Number.parseInt(dialog.style.width, 10)).toBe(initialWidth + 20);

    fireEvent.keyDown(resizeButton!, { key: "ArrowRight" });
    expect(Number.parseInt(dialog.style.width, 10)).toBe(initialWidth + 36);

    fireEvent.click(screen.getByRole("button", { name: /minimize|réduire/i }));
    expect(onMinimize).toHaveBeenCalledOnce();
    expect(screen.queryByText("Window content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /restore|restaurer/i }));
    expect(screen.getByText("Window content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close window|fermer la fenêtre/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
