import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Download, Pause, Play, Plus, Search, Trash2 } from "lucide-react";
import type { LyricLine, LyricsTrack } from "@/types/lyrics";
import { formatLrcTimestamp, parseLrcTimestamp } from "@/utils/lrcTimestamp";
import { getLyrics, importFromTononkiraUrl } from "@/services/lyricsApi";

interface LyricsLinesEditorProps {
  lines: LyricLine[];
  onChange: (lines: LyricLine[]) => void;
  liveSync?: {
    currentTimeMs: number;
    isPlaying: boolean;
    onTogglePlayback: () => void;
  };
  /** The track being edited. Its provider/id/duration are needed to re-run a search with corrected artist/title, and to time-estimate a freshly imported Tononkira page. */
  track?: LyricsTrack;
}

export function LyricsLinesEditor({ lines, onChange, track, liveSync }: LyricsLinesEditorProps) {
  const { t } = useTranslation();
  const [tononkiraUrl, setTononkiraUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(false);
  const [searchArtist, setSearchArtist] = useState(track?.artist ?? "");
  const [searchTitle, setSearchTitle] = useState(track?.title ?? "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);

  async function importFromTononkira() {
    if (!tononkiraUrl.trim() || importing) return;
    setImporting(true);
    setImportError(false);
    try {
      const scraped = await importFromTononkiraUrl(tononkiraUrl.trim(), track?.duration);
      if (!scraped) {
        setImportError(true);
        return;
      }
      onChange(scraped);
      setTononkiraUrl("");
    } catch {
      setImportError(true);
    } finally {
      setImporting(false);
    }
  }

  async function searchWithCorrectedMetadata() {
    if (!track || !searchArtist.trim() || !searchTitle.trim() || searching) return;
    setSearching(true);
    setSearchError(false);
    try {
      const result = await getLyrics({
        ...track,
        artist: searchArtist.trim(),
        title: searchTitle.trim(),
      });
      if (!result) {
        setSearchError(true);
        return;
      }
      onChange(result.lines);
    } catch {
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  }

  function updateLine(index: number, patch: Partial<LyricLine>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  // A line's "end" isn't its own field - the LRC format stores one
  // timestamp per line, and a line plays until the next one starts. So
  // editing "end" here actually writes to the next line's startTimeMs;
  // the last line has no next line, so its end stays fixed to the track's
  // end and isn't editable.
  function updateEndTime(index: number, endTimeMs: number | null) {
    if (index + 1 >= lines.length) return;
    updateLine(index + 1, { startTimeMs: endTimeMs });
  }

  function moveLine(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= lines.length) return;
    const next = [...lines];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addLine() {
    onChange([...lines, { startTimeMs: null, text: "" }]);
  }

  return (
    <div className="mt-5">
      {track ? (
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            {t("lyrics.searchMetadataLabel")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchArtist}
              onChange={(event) => {
                setSearchArtist(event.target.value);
                setSearchError(false);
              }}
              placeholder={t("lyrics.searchArtistPlaceholder")}
              aria-label={t("lyrics.searchArtistPlaceholder")}
              className="min-w-0 flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={searchTitle}
              onChange={(event) => {
                setSearchTitle(event.target.value);
                setSearchError(false);
              }}
              placeholder={t("lyrics.searchTitlePlaceholder")}
              aria-label={t("lyrics.searchTitlePlaceholder")}
              className="min-w-0 flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={searchWithCorrectedMetadata}
              disabled={searching || !searchArtist.trim() || !searchTitle.trim()}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <Search aria-hidden="true" className="h-3.5 w-3.5" />
              {searching ? t("lyrics.searching") : t("lyrics.searchButton")}
            </button>
          </div>
          {searchError ? (
            <p className="mt-1 text-xs text-destructive">{t("lyrics.searchNotFound")}</p>
          ) : null}
        </div>
      ) : null}
      <div className="mb-3">
        <label htmlFor="tononkira-import-url" className="mb-1 block text-xs font-medium text-muted-foreground">
          {t("lyrics.tononkiraImportLabel")}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="tononkira-import-url"
            type="url"
            value={tononkiraUrl}
            onChange={(event) => {
              setTononkiraUrl(event.target.value);
              setImportError(false);
            }}
            placeholder={t("lyrics.tononkiraImportPlaceholder")}
            className="min-w-0 flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={importFromTononkira}
            disabled={importing || !tononkiraUrl.trim()}
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {importing ? t("lyrics.tononkiraImporting") : t("lyrics.tononkiraImportButton")}
          </button>
        </div>
        {importError ? (
          <p className="mt-1 text-xs text-destructive">{t("lyrics.tononkiraImportError")}</p>
        ) : null}
      </div>
      {liveSync ? (
        <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-sm text-foreground">{t("lyrics.liveSyncInstructions")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={liveSync.onTogglePlayback}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={t(liveSync.isPlaying ? "lyrics.pauseSyncPlayback" : "lyrics.playSyncPlayback")}
            >
              {liveSync.isPlaying ? <Pause aria-hidden="true" className="h-3.5 w-3.5" /> : <Play aria-hidden="true" className="h-3.5 w-3.5" />}
              {t(liveSync.isPlaying ? "lyrics.pauseSyncPlayback" : "lyrics.playSyncPlayback")}
            </button>
            <span className="text-xs tabular-nums text-muted-foreground" aria-live="off">
              {t("lyrics.syncCurrentTime", { time: formatLrcTimestamp(liveSync.currentTimeMs) || "0:00:00" })}
            </span>
          </div>
        </div>
      ) : null}
      <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-background p-2 sm:max-h-96">
        {lines.map((line, index) => (
          <LyricsLineRow
            key={index}
            lineNumber={index + 1}
            line={line}
            endTimeMs={lines[index + 1]?.startTimeMs ?? null}
            isFirst={index === 0}
            isLast={index === lines.length - 1}
            isSelected={selectedLineIndex === index}
            liveSync={liveSync ? {
              currentTimeMs: liveSync.currentTimeMs,
              onSelect: () => setSelectedLineIndex(index),
              onMarkStart: () => updateLine(index, { startTimeMs: Math.round(liveSync.currentTimeMs), endTimeMs: null }),
              onMarkEnd: () => updateLine(index, { endTimeMs: Math.round(liveSync.currentTimeMs) }),
            } : undefined}
            onChangeTimestamp={(startTimeMs) => updateLine(index, { startTimeMs })}
            onChangeEndTimestamp={(endTimeMs) => updateEndTime(index, endTimeMs)}
            onChangeText={(text) => updateLine(index, { text })}
            onMoveUp={() => moveLine(index, -1)}
            onMoveDown={() => moveLine(index, 1)}
            onRemove={() => removeLine(index)}
          />
        ))}
        {lines.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            {t("lyrics.noLines")}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={addLine}
        className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        {t("lyrics.addLine")}
      </button>
    </div>
  );
}

function LyricsLineRow({
  line,
  lineNumber,
  endTimeMs,
  isFirst,
  isLast,
  isSelected,
  liveSync,
  onChangeTimestamp,
  onChangeEndTimestamp,
  onChangeText,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  line: LyricLine;
  lineNumber: number;
  endTimeMs: number | null;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  liveSync?: {
    currentTimeMs: number;
    onSelect: () => void;
    onMarkStart: () => void;
    onMarkEnd: () => void;
  };
  onChangeTimestamp: (startTimeMs: number | null) => void;
  onChangeEndTimestamp: (endTimeMs: number | null) => void;
  onChangeText: (text: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [timestampText, setTimestampText] = useState(
    formatLrcTimestamp(line.startTimeMs),
  );
  const [endTimestampText, setEndTimestampText] = useState(
    formatLrcTimestamp(endTimeMs),
  );

  // Keep the fields' text in sync when the underlying values change from
  // outside this row (e.g. the whole list is reset to a fresh override, or
  // editing the next line's start shifts this line's displayed end),
  // without clobbering what the admin is actively typing mid-edit.
  useEffect(() => {
    setTimestampText(formatLrcTimestamp(line.startTimeMs));
  }, [line.startTimeMs]);

  useEffect(() => {
    setEndTimestampText(formatLrcTimestamp(endTimeMs));
  }, [endTimeMs]);

  return (
    <div className={`flex items-center gap-2 rounded-md p-1 ${isSelected ? "bg-primary/10 ring-1 ring-primary/40" : ""}`}>
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={t("lyrics.moveLineUp")}
          title={t("lyrics.moveLineUp")}
          className="inline-flex h-4 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowUp aria-hidden="true" className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={t("lyrics.moveLineDown")}
          title={t("lyrics.moveLineDown")}
          className="inline-flex h-4 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowDown aria-hidden="true" className="h-3 w-3" />
        </button>
      </div>
      {liveSync ? (
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={liveSync.onSelect}
            aria-pressed={isSelected}
            aria-label={t("lyrics.selectLine", { number: lineNumber })}
            title={t("lyrics.selectLineShort")}
            className="min-h-8 rounded-md border border-border px-2 text-xs font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isSelected ? t("lyrics.selectedLine") : t("lyrics.selectLineShort")}
          </button>
          <span className="text-center font-mono text-[10px] text-muted-foreground" aria-label={t("lyrics.timestampLabel")}>
            {formatLrcTimestamp(line.startTimeMs) || "—"}–{formatLrcTimestamp(line.endTimeMs === undefined ? endTimeMs : line.endTimeMs) || "—"}
          </span>
        </div>
      ) : (
      <div className="flex shrink-0 items-center gap-1">
        <input
          type="text"
          value={timestampText}
          onChange={(event) => setTimestampText(event.target.value)}
          onBlur={() => onChangeTimestamp(parseLrcTimestamp(timestampText))}
          placeholder="h:mm:ss"
          aria-label={t("lyrics.timestampLabel")}
          className="w-20 rounded-md border border-border bg-secondary px-2 py-1.5 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
        />
        <span aria-hidden="true" className="text-muted-foreground">–</span>
        <input
          type="text"
          value={isLast ? "" : endTimestampText}
          onChange={(event) => setEndTimestampText(event.target.value)}
          onBlur={() => onChangeEndTimestamp(parseLrcTimestamp(endTimestampText))}
          disabled={isLast}
          placeholder={isLast ? t("lyrics.endOfTrack") : "h:mm:ss"}
          aria-label={t("lyrics.endTimestampLabel")}
          className="w-20 rounded-md border border-border bg-secondary px-2 py-1.5 font-mono text-xs outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
      </div>
      )}
      <input
        type="text"
        value={line.text}
        onChange={(event) => onChangeText(event.target.value)}
        aria-label={t("lyrics.lineTextLabel")}
        className="min-w-0 flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
      {liveSync && isSelected ? (
        <div className="flex shrink-0 flex-col gap-1">
          <button
            type="button"
            onClick={liveSync.onMarkStart}
            className="min-h-8 rounded-md border border-border px-2 text-[11px] font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {t("lyrics.markLineStart")}
          </button>
          <button
            type="button"
            onClick={liveSync.onMarkEnd}
            disabled={line.startTimeMs === null || liveSync.currentTimeMs < line.startTimeMs}
            className="min-h-8 rounded-md border border-border px-2 text-[11px] font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
          >
            {t("lyrics.markLineEnd")}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onRemove}
        aria-label={t("lyrics.removeLine")}
        title={t("lyrics.removeLine")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
