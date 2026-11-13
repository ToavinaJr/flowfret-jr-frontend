import { useEffect, useRef, useState } from "react";

/** Follow lyrics inside their own scroll area without moving the page. */
export function useLyricsAutoScroll(activeIndex: number) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setVisible(false);
    if (!container) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

  useEffect(() => {
    const active = activeRef.current;
    if (!visible || !container || !active || activeIndex < 0) return;
    const bounds = container.getBoundingClientRect();
    // Check again in case the user scrolled before the observer delivered its update.
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight ||
        bounds.right <= 0 || bounds.left >= window.innerWidth) return;
    const line = active.getBoundingClientRect();
    container.scrollTo({
      top: container.scrollTop + line.top - bounds.top - container.clientTop
        - (container.clientHeight - line.height) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [activeIndex, container, visible]);

  return { containerRef: setContainer, activeRef };
}
