import { useEffect, useRef, useState } from "react";

export function ScrollingTrackText({
  text,
  className = "",
  scrollOnHover = false,
}: {
  text: string;
  className?: string;
  scrollOnHover?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const label = textRef.current;
    if (!container || !label) return;
    const measure = () => setOverflows(label.scrollWidth > container.clientWidth + 1);
    measure();
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(measure);
    observer?.observe(container);
    observer?.observe(label);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`player-track-text min-w-0 overflow-x-auto overflow-y-hidden whitespace-nowrap ${className}`}
      title={text}
    >
      <div
        className={`${overflows ? "media-player-marquee flex w-max" : "min-w-0"}${scrollOnHover ? " card-title-marquee" : ""}`}
        style={overflows ? { animationDuration: `${Math.min(32, Math.max(8, text.length / 5))}s` } : undefined}
      >
        <span
          ref={textRef}
          className={overflows ? "shrink-0 pr-8" : "block truncate"}
        >
          {text}
        </span>
        {overflows ? (
          <span aria-hidden="true" className="shrink-0 pr-8">
            {text}
          </span>
        ) : null}
      </div>
    </div>
  );
}
