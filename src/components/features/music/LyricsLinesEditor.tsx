import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, Download, Plus, Search, Trash2 } from "lucide-react";
import type { LyricLine, LyricsTrack } from "@/types/lyrics";
import { formatLrcTimestamp, parseLrcTimestamp } from "@/utils/lrcTimestamp";
import { getLyrics, importFromTononkiraUrl } from "@/services/lyricsApi";

interface LyricsLinesEditorProps {
  lines: LyricLine[];
  onChange: (lines: LyricLine[]) => void;
  /** The track being edited. Its provider/id/duration are needed to re-run a search with corrected artist/title, and to time-estimate a freshly imported Tononkira page. */
  track?: LyricsTrack;
}

export function LyricsLinesEditor({ lines, onChange, track }: LyricsLinesEditorProps) {
  const { t } = useTranslation();
  const [tononkiraUrl, setTononkiraUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(false);
  const [searchArtist, setSearchArtist] = useState(track?.artist ?? "");
  const [searchTitle, setSearchTitle] = useState(track?.title ?? "");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

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
      <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-background p-2 sm:max-h-96">
        {lines.map((line, index) => (
          <LyricsLineRow
            key={index}
            line={line}
            // The "end" of a line is implicit in the LRC format: it plays
            // until the next line's timestamp starts. Shown here purely as
            // a read-only cue while aligning — nothing extra is stored.
            endTimeMs={lines[index + 1]?.startTimeMs ?? null}
            isFirst={index === 0}
            isLast={index === lines.length - 1}
            onChangeTimestamp={(startTimeMs) => updateLine(index, { startTimeMs })}
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
  endTimeMs,
  isFirst,
  isLast,
  onChangeTimestamp,
  onChangeText,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  line: LyricLine;
  endTimeMs: number | null;
  isFirst: boolean;
  isLast: boolean;
  onChangeTimestamp: (startTimeMs: number | null) => void;
  onChangeText: (text: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [timestampText, setTimestampText] = useState(
    formatLrcTimestamp(line.startTimeMs),
  );

  // Keep the field's text in sync when the underlying value changes from
  // outside this row (e.g. the whole list is reset to a fresh override),
  // without clobbering what the admin is actively typing mid-edit.
  useEffect(() => {
    setTimestampText(formatLrcTimestamp(line.startTimeMs));
  }, [line.startTimeMs]);

  return (
    <div className="flex items-center gap-2">
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
        <span className="w-20 shrink-0 font-mono text-xs text-muted-foreground">
          – {formatLrcTimestamp(endTimeMs) || t("lyrics.endOfTrack")}
        </span>
      </div>
      <input
        type="text"
        value={line.text}
        onChange={(event) => onChangeText(event.target.value)}
        aria-label={t("lyrics.lineTextLabel")}
        className="min-w-0 flex-1 rounded-md border border-border bg-secondary px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
      />
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
