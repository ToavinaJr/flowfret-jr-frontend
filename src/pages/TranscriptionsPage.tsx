import { useEffect, useState } from "react";
import { Download, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import {
  downloadTranscriptionLrc,
  listTranscriptions,
  retryTranscription,
} from "@/services/transcriptionsApi";
import type { TranscriptionResponse } from "@/types/transcription";
import { useTranslation } from "react-i18next";
import { TranscriptionsWorkspaceSkeleton } from "@/components/skeletons/TranscriptionsWorkspaceSkeleton";

const TRANSCRIPTIONS_PAGE_SIZE = 10;

export default function TranscriptionsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<TranscriptionResponse[]>([]);
  const [selected, setSelected] = useState<TranscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    void listTranscriptions(TRANSCRIPTIONS_PAGE_SIZE, page * TRANSCRIPTIONS_PAGE_SIZE)
      .then((result) => {
        setItems(result.nodes);
        setTotalCount(result.totalCount);
        setSelected(result.nodes[0] ?? null);
      })
      .catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : t("common.loadFailed")),
      )
      .finally(() => setLoading(false));
  }, [page, t]);

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
        <TranscriptionsWorkspaceSkeleton />
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex max-h-[48dvh] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-3 md:max-h-none">
            <div className="min-h-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto">
              {items.map((item) => (
              <button
                type="button"
                key={item.transcriptionId}
                onClick={() => setSelected(item)}
                className={`min-w-0 w-full overflow-hidden rounded-md p-3 text-left ${selected?.transcriptionId === item.transcriptionId ? "bg-primary/10" : "hover:bg-secondary"}`}
              >
                <span className="block truncate text-sm font-medium">{item.title ?? item.trackId}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.artist ?? t("transcriptions.unknownArtist")} · {item.status}</span>
              </button>
              ))}
              {!items.length && <p className="p-3 text-sm text-muted-foreground">{t("transcriptions.empty")}</p>}
            </div>
            {totalCount > TRANSCRIPTIONS_PAGE_SIZE && (
              <footer className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <span className="text-xs tabular-nums text-muted-foreground">{t("admin.pageIndicator", { page: page + 1, total: Math.ceil(totalCount / TRANSCRIPTIONS_PAGE_SIZE) })}</span>
                <div className="flex gap-1">
                  <button type="button" aria-label={t("admin.previousPage")} disabled={page === 0 || loading} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border disabled:opacity-40"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
                  <button type="button" aria-label={t("admin.nextPage")} disabled={(page + 1) * TRANSCRIPTIONS_PAGE_SIZE >= totalCount || loading} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border disabled:opacity-40"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
                </div>
              </footer>
            )}
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
  const progress = Math.max(0, Math.min(100, item.progress));
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="mr-auto">
          <h2 className="break-words font-semibold">{item.title ?? t("transcriptions.fallbackTitle")}</h2>
          <p className="text-xs text-muted-foreground">{t("transcriptions.progress", { progress })}</p>
        </div>
        {item.status === "FAILED" && item.provider === "AUDIUS" && (
          <button type="button" onClick={() => void onRetry()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm"><RefreshCw className="h-4 w-4" /> {t("transcriptions.retry")}</button>
        )}
        {item.lrcAvailable && (
          <button type="button" onClick={() => void downloadTranscriptionLrc(item.transcriptionId)} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm text-primary-foreground"><Download className="h-4 w-4" /> LRC</button>
        )}
      </div>
      <div
        role="progressbar"
        aria-label={t("transcriptions.progress", { progress })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"
      >
        <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
      </div>
      {item.error && <p className="mt-3 break-words rounded-md bg-destructive/10 p-3 text-sm text-destructive">{item.error.code === "TRANSCRIPTION_PENDING_TIMEOUT" ? t("lyrics.pendingTimeout") : item.error.message}</p>}
      <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
        {item.segments.map((segment) => (
          <p key={segment.id} className="break-words rounded-md bg-secondary p-3 text-sm">
            <span className="mr-2 text-xs text-muted-foreground">{segment.start.toFixed(1)}s</span>{segment.text}
          </p>
        ))}
      </div>
    </section>
  );
}
