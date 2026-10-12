import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import type { LyricLine } from "@/types/lyrics";
import { formatLrcTimestamp, parseLrcTimestamp } from "@/utils/lrcTimestamp";

interface LyricsLinesEditorProps {
  lines: LyricLine[];
  onChange: (lines: LyricLine[]) => void;
}

export function LyricsLinesEditor({ lines, onChange }: LyricsLinesEditorProps) {
  const { t } = useTranslation();

  function updateLine(index: number, patch: Partial<LyricLine>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  function addLine() {
    onChange([...lines, { startTimeMs: null, text: "" }]);
  }

  return (
    <div className="mt-5">
      <div className="max-h-72 space-y-1.5 overflow-y-auto rounded-lg border border-border bg-background p-2 sm:max-h-96">
        {lines.map((line, index) => (
          <LyricsLineRow
            key={index}
            line={line}
            onChangeTimestamp={(startTimeMs) => updateLine(index, { startTimeMs })}
            onChangeText={(text) => updateLine(index, { text })}
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
  onChangeTimestamp,
  onChangeText,
  onRemove,
}: {
  line: LyricLine;
  onChangeTimestamp: (startTimeMs: number | null) => void;
  onChangeText: (text: string) => void;
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
      <input
        type="text"
        value={timestampText}
        onChange={(event) => setTimestampText(event.target.value)}
        onBlur={() => onChangeTimestamp(parseLrcTimestamp(timestampText))}
        placeholder="mm:ss.cc"
        aria-label={t("lyrics.timestampLabel")}
        className="w-24 shrink-0 rounded-md border border-border bg-secondary px-2 py-1.5 font-mono text-xs outline-none focus:ring-2 focus:ring-primary"
      />
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
