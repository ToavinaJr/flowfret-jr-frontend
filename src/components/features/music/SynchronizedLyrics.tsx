import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { TranscriptionSegment } from "@/types/transcription";

interface Props { segments: readonly TranscriptionSegment[]; activeIndex: number; onSeek: (seconds: number) => void; }

export function SynchronizedLyrics({ segments, activeIndex, onSeek }: Props) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (activeIndex < 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }, [activeIndex]);

  if (segments.length === 0) return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">{t("lyrics.empty")}</div>;
  return (
    <div className="h-56 overflow-y-auto rounded-lg border border-border bg-background/60 px-3 py-20" aria-live="polite" aria-label={t("lyrics.synchronized")}>
      {segments.map((segment, index) => (
        <button key={segment.id} ref={index === activeIndex ? activeRef : undefined} type="button" onClick={() => onSeek(segment.start)}
          className={`block w-full rounded-md px-3 py-2 text-left transition-[transform,color,background-color,opacity,font-size] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === activeIndex ? "scale-[1.02] bg-primary/15 text-base font-semibold text-foreground" : "text-sm text-muted-foreground opacity-55 hover:opacity-90"}`}>
          {segment.text}
        </button>
      ))}
    </div>
  );
}

