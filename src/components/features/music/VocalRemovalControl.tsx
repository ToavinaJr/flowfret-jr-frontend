import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import { supportsVocalRemoval, vocalRemovalFailureReason } from "@/services/audioStemsApi";
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { debugLog } from "@/utils/debug";
import { PopupTitle } from "@/components/ui/PopupTitle";

export function VocalRemovalControl() {
  const { t } = useTranslation();
  const { item, vocalRemoval, stemStatus, stemProgress, stemPhase, stemErrorCode, stemSimulated, prepareStems, setVocalRemoval } = usePlayback();
  const supported = supportsVocalRemoval(item);
  const percent = Math.round((vocalRemoval ?? 0) * 100);
  const preparing = stemStatus === "preparing";
  return (
    <Dialog onOpenChange={(open) => {
      if (open) {
        debugLog("audio_stems.panel_opened", {
          supported,
          provider: item?.provider ?? "unknown",
          hasTrackId: Boolean(item?.providerTrackId),
        });
      }
    }}>
      <DialogTrigger asChild>
        <button type="button" aria-label={t("equalizer.open")} title={t("equalizer.title")}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary ${percent > 0 ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
          <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto overscroll-contain rounded-xl motion-reduce:animate-none">
        <PopupTitle icon={SlidersHorizontal}>{t("equalizer.title")}</PopupTitle>
        <DialogDescription>{t("equalizer.description")}</DialogDescription>
        {stemSimulated && <p role="status" className="text-sm text-muted-foreground">{t("equalizer.simulated")}</p>}
        <p className="truncate text-sm font-medium">{item?.title}</p>
        {!supported ? <p className="text-sm text-muted-foreground">{t("equalizer.unsupported")}</p> : (
          <>
            {(stemStatus === "idle" || stemStatus === "failed") && (
              <button type="button" onClick={() => {
                debugLog("audio_stems.prepare_clicked", {
                  provider: item?.provider ?? "unknown",
                  hasTrackId: Boolean(item?.providerTrackId),
                  retry: stemStatus === "failed",
                });
                void prepareStems();
              }}
                className="min-h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring">
                {t(stemStatus === "failed" ? "common.retry" : "equalizer.prepare")}
              </button>
            )}
            {stemStatus === "failed" && <p role="alert" className="text-sm text-destructive">
              {t(`equalizer.errors.${vocalRemovalFailureReason(stemErrorCode)}`)}
            </p>}
            {preparing && <div role="status" className="space-y-2 text-sm" aria-live="polite">
              <p>{t(`equalizer.phase.${stemPhase ?? "queue"}`)}</p>
              <div role="progressbar" aria-label={t(`equalizer.phase.${stemPhase ?? "queue"}`)} aria-valuemin={0} aria-valuemax={100}
                aria-valuenow={stemProgress > 0 ? Math.round(stemProgress) : undefined}
                className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full bg-primary ${stemProgress > 0 ? "transition-[width] duration-300" : "w-1/3 animate-pulse"}`}
                  style={stemProgress > 0 ? { width: `${Math.min(99, stemProgress)}%` } : undefined} />
              </div>
            </div>}
            <div className="space-y-3" aria-busy={preparing}>
              <label htmlFor="vocal-removal" className="block text-sm font-medium">{t("equalizer.removal", { percent })}</label>
              <input id="vocal-removal" name="vocalRemoval" type="range" min={0} max={100} step={1}
                disabled={stemStatus !== "ready"} value={percent}
                aria-valuetext={t("equalizer.removal", { percent })}
                onChange={(event) => void setVocalRemoval(Number(event.target.value) / 100)}
                className="h-11 w-full accent-primary focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40" />
              <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                <span>{t("equalizer.fullVocals")}</span><span>{t("equalizer.instrumental")}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t("equalizer.quality")}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
