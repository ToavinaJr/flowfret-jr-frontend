import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useLyricsAutoScroll } from "./useLyricsAutoScroll";

function Panel({ index, loaded = true }: { index: number; loaded?: boolean }) {
  const { containerRef, activeRef } = useLyricsAutoScroll(index);
  return loaded ? <div ref={containerRef} data-testid="panel"><button ref={activeRef}>Line {index}</button></div> : null;
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("lyrics auto scroll", () => {
  it("only scrolls the visible container and resumes when it returns to the viewport", () => {
    let notify: (entries: { isIntersecting: boolean }[]) => void = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: typeof notify) { notify = callback; }
      observe() {}
      disconnect = disconnect;
    });
    const pageScroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const { rerender, unmount } = render(<Panel index={0} loaded={false} />);
    rerender(<Panel index={0} />);
    const panel = screen.getByTestId("panel");
    const scroll = vi.fn();
    panel.scrollTo = scroll;
    Object.defineProperty(panel, "clientHeight", { value: 200 });
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100, 300, 200));
    vi.spyOn(screen.getByRole("button"), "getBoundingClientRect").mockReturnValue(new DOMRect(0, 400, 300, 40));
    act(() => notify([{ isIntersecting: true }]));
    expect(scroll).toHaveBeenLastCalledWith({ top: 220, behavior: "smooth" });
    scroll.mockClear();
    act(() => notify([{ isIntersecting: false }]));
    rerender(<Panel index={1} />);
    expect(scroll).not.toHaveBeenCalled();
    act(() => notify([{ isIntersecting: true }]));
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(pageScroll).not.toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });

  it("does not scroll offscreen while an observer update is pending", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { rerender } = render(<Panel index={0} />);
    const panel = screen.getByTestId("panel");
    panel.scrollTo = vi.fn();
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue(new DOMRect(0, -400, 300, 200));
    rerender(<Panel index={1} />);
    expect(panel.scrollTo).not.toHaveBeenCalled();
  });
});
