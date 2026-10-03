import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { Lyrics, LyricsStatus } from "@/types/lyrics";
import { findActiveLyricLine } from "@/utils/lyrics";

interface Props {
  lyrics: Lyrics | null;
  status: LyricsStatus;
  currentTime: number;
  onSeek?: (seconds: number) => void;
}

export function LyricsPanel({ lyrics, status, currentTime, onSeek }: Props) {
  const { t } = useTranslation();
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const activeIndex = useMemo(
    () => findActiveLyricLine(lyrics?.lines ?? [], currentTime * 1000),
    [currentTime, lyrics?.lines],
  );

  useEffect(() => {
    if (activeIndex < 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }, [activeIndex]);

  if (status === "loading" || status === "idle") return <PanelMessage text={t("lyrics.loading")} />;
  if (status === "error") return <PanelMessage text={t("lyrics.error")} />;
  if (status === "not-found" || !lyrics) return <PanelMessage text={t("lyrics.unavailable")} />;
  if (lyrics.instrumental) return <PanelMessage text={t("lyrics.instrumental")} />;
  if (!lyrics.synced) return <div className="h-full max-h-64 overflow-y-auto whitespace-pre-wrap px-4 py-5 text-sm leading-7 text-foreground">{lyrics.plainLyrics}</div>;

  return (
    <div className="h-full max-h-64 overflow-y-auto px-3 py-24" aria-live="polite" aria-label={t("lyrics.title")}>
      {lyrics.lines.map((line, index) => (
        <button
          key={`${line.startTimeMs}-${index}`}
          ref={index === activeIndex ? activeRef : undefined}
          type="button"
          disabled={!onSeek || line.startTimeMs === null}
          onClick={() => line.startTimeMs !== null && onSeek?.(line.startTimeMs / 1000)}
          className={`block w-full rounded-md px-3 py-2 text-center transition-[transform,color,background-color,opacity,font-size] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === activeIndex ? "scale-[1.02] bg-primary/15 text-base font-semibold text-foreground" : "text-sm text-muted-foreground opacity-55 hover:opacity-90"}`}
        >
          {line.text || " "}
        </button>
      ))}
    </div>
  );
}

function PanelMessage({ text }: { text: string }) {
  return <div className="flex h-full min-h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">{text}</div>;
}
