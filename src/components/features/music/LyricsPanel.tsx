import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Lyrics, LyricsStatus } from "@/types/lyrics";
import { findActiveLyricLine } from "@/utils/lyrics";

interface Props {
  lyrics: Lyrics | null;
  status: LyricsStatus;
  currentTime: number;
  onSeek?: (seconds: number) => void;
}

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 30;
const FONT_SIZE_STEP = 2;
const FONT_SIZE_STORAGE_KEY = "flowfret.lyrics.font-size.v1";

function readFontSize(): number {
  try {
    const stored = Number(window.localStorage.getItem(FONT_SIZE_STORAGE_KEY));
    return Number.isFinite(stored) && stored >= MIN_FONT_SIZE && stored <= MAX_FONT_SIZE
      ? stored
      : DEFAULT_FONT_SIZE;
  } catch {
    return DEFAULT_FONT_SIZE;
  }
}

export function LyricsPanel({ lyrics, status, currentTime, onSeek }: Props) {
  const { t } = useTranslation();
  const [fontSize, setFontSize] = useState(readFontSize);
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

  useEffect(() => {
    try {
      window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize));
    } catch {
      // Text size remains adjustable for the current view without storage.
    }
  }, [fontSize]);

  const sizeControls = (
    <div className="flex shrink-0 items-center gap-1 border-b border-border px-2 py-1.5" data-no-window-drag>
      <button type="button" disabled={fontSize <= MIN_FONT_SIZE} onClick={() => setFontSize((size) => Math.max(MIN_FONT_SIZE, size - FONT_SIZE_STEP))} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-40" aria-label={t("lyrics.decreaseTextSize")} title={t("lyrics.decreaseTextSize")}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-10 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">{fontSize}px</span>
      <button type="button" disabled={fontSize >= MAX_FONT_SIZE} onClick={() => setFontSize((size) => Math.min(MAX_FONT_SIZE, size + FONT_SIZE_STEP))} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-40" aria-label={t("lyrics.increaseTextSize")} title={t("lyrics.increaseTextSize")}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  if (status === "loading" || status === "idle") return <PanelMessage text={t("lyrics.loading")} />;
  if (status === "error") return <PanelMessage text={t("lyrics.error")} />;
  if (status === "not-found" || !lyrics) return <PanelMessage text={t("lyrics.unavailable")} />;
  if (lyrics.instrumental) return <PanelMessage text={t("lyrics.instrumental")} />;
  if (!lyrics.synced) return <div className="flex h-full min-h-0 flex-col"><div className="shrink-0">{sizeControls}</div><div className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap px-4 py-5 leading-relaxed text-foreground" style={{ fontSize: `${fontSize}px` }}>{lyrics.plainLyrics}</div></div>;

  return (
    <div className="flex h-full min-h-0 flex-col" aria-live="polite" aria-label={t("lyrics.title")}>
      {sizeControls}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-8">
      {lyrics.lines.map((line, index) => (
        <button
          key={`${line.startTimeMs}-${index}`}
          ref={index === activeIndex ? activeRef : undefined}
          type="button"
          disabled={!onSeek || line.startTimeMs === null}
          onClick={() => line.startTimeMs !== null && onSeek?.(line.startTimeMs / 1000)}
          className={`block w-full rounded-md px-3 py-2 text-center transition-[transform,color,background-color,opacity,font-size] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === activeIndex ? "scale-[1.02] bg-primary/15 font-semibold text-foreground" : "text-muted-foreground opacity-55 hover:opacity-90"}`}
          style={{ fontSize: `${fontSize * (index === activeIndex ? 1.1 : 1)}px` }}
        >
          {line.text || " "}
        </button>
      ))}
      </div>
    </div>
  );
}

function PanelMessage({ text }: { text: string }) {
  return <div className="flex h-full min-h-40 items-center justify-center px-4 text-center text-sm text-muted-foreground">{text}</div>;
}
