import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import {
  downloadTranscriptionLrc,
  listTranscriptions,
  retryTranscription,
} from "@/services/transcriptionsApi";
import type { TranscriptionResponse } from "@/types/transcription";
import { useTranslation } from "react-i18next";

export default function TranscriptionsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<TranscriptionResponse[]>([]);
  const [selected, setSelected] = useState<TranscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listTranscriptions()
      .then((rows) => {
        setItems(rows);
        setSelected(rows[0] ?? null);
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : t("common.loadFailed")),
      )
      .finally(() => setLoading(false));
  }, [t]);

  async function retry(item: TranscriptionResponse) {
    const audioUrl = `https://api.audius.co/v1/tracks/${encodeURIComponent(item.trackId)}/stream`;
    const updated = await retryTranscription(item.transcriptionId, audioUrl);
    setItems((current) => current.map((row) => row.transcriptionId === updated.transcriptionId ? updated : row));
    setSelected(updated);
    toast.success(t("transcriptions.retried"));
  }

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("transcriptions.title")}</h1>
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="space-y-2 rounded-xl border border-border bg-card p-3">
            {items.map((item) => (
              <button
                type="button"
                key={item.transcriptionId}
                onClick={() => setSelected(item)}
                className={`w-full rounded-md p-3 text-left ${selected?.transcriptionId === item.transcriptionId ? "bg-primary/10" : "hover:bg-secondary"}`}
              >
                <span className="block truncate text-sm font-medium">{item.title ?? item.trackId}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.artist ?? t("transcriptions.unknownArtist")} · {item.status}</span>
              </button>
            ))}
            {!items.length && <p className="p-3 text-sm text-muted-foreground">{t("transcriptions.empty")}</p>}
          </aside>
          {selected && <TranscriptionDetails item={selected} onRetry={() => retry(selected)} />}
        </div>
      )}
    </div>
  );
}

function TranscriptionDetails({
  item,
  onRetry,
}: {
  item: TranscriptionResponse;
  onRetry: () => Promise<void>;
}) {
  const { t } = useTranslation();
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="mr-auto">
          <h2 className="font-semibold">{item.title ?? t("transcriptions.fallbackTitle")}</h2>
          <p className="text-xs text-muted-foreground">{t("transcriptions.progress", { progress: item.progress })}</p>
        </div>
        {item.status === "FAILED" && item.provider === "AUDIUS" && (
          <button type="button" onClick={() => void onRetry()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm"><RefreshCw className="h-4 w-4" /> {t("transcriptions.retry")}</button>
        )}
        {item.lrcAvailable && (
          <button type="button" onClick={() => void downloadTranscriptionLrc(item.transcriptionId)} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground"><Download className="h-4 w-4" /> LRC</button>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }} />
      </div>
      {item.error && <p className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{item.error.message}</p>}
      <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
        {item.segments.map((segment) => (
          <p key={segment.id} className="rounded-md bg-secondary p-3 text-sm">
            <span className="mr-2 text-xs text-muted-foreground">{segment.start.toFixed(1)}s</span>{segment.text}
          </p>
        ))}
      </div>
    </section>
  );
}
