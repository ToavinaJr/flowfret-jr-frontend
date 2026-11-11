import { ListMusic, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { PlaybackItem } from "@/contexts/playback-context";
import { useRef, useState, type PointerEvent } from "react";

interface QueueDialogProps {
  queue: PlaybackItem[];
  currentIndex: number;
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  compact?: boolean;
}

export function QueueDialog({ queue, currentIndex, onPlay, onRemove, onMove, compact = false }: QueueDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragSource = useRef<number | null>(null);
  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (dragSource.current === null) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-queue-index]");
    const targetIndex = Number(target?.dataset.queueIndex);
    if (target && Number.isInteger(targetIndex) && targetIndex !== dragSource.current) {
      onMove(dragSource.current, targetIndex);
      dragSource.current = targetIndex;
      setDraggedIndex(targetIndex);
    }
  };
  const stopPointerDrag = () => {
    dragSource.current = null;
    setDraggedIndex(null);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={`${compact ? "flex h-9 w-9" : "hidden h-10 w-10 sm:flex"} shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary`} aria-label={t("mediaPlayer.openQueue")}>
          <ListMusic className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{t("mediaPlayer.queueTitle")}</DialogTitle>
          <DialogDescription>{t("mediaPlayer.queueCount", { count: queue.length })}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-2 overflow-y-auto">
          {queue.map((track, index) => (
            <div
              key={`${track.id}:${track.src}:${queue.slice(0, index).filter((previous) => previous.id === track.id && previous.src === track.src).length}`}
              data-queue-index={index}
              className={`flex min-h-14 cursor-grab items-center gap-2 rounded-md border p-2 active:cursor-grabbing ${index === currentIndex ? "border-primary/50 bg-primary/5" : "border-border"} ${draggedIndex === index ? "opacity-40" : ""}`}
            >
              <button
                type="button"
                aria-label={t("mediaPlayer.dragQueueItem")}
                onPointerDown={(event) => {
                  event.preventDefault();
                  dragSource.current = index;
                  setDraggedIndex(index);
                  event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={handlePointerMove}
                onPointerUp={stopPointerDrag}
                onPointerCancel={stopPointerDrag}
                className="flex size-8 shrink-0 touch-none items-center justify-center rounded text-muted-foreground hover:bg-secondary"
              >
                <GripVertical className="size-4" />
              </button>
              <img src={track.imageUrl || "/favicon.svg"} alt="" className="size-9 shrink-0 rounded object-cover" />
              <button type="button" onClick={() => { onPlay(index); setOpen(false); }} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-medium">{track.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{track.subtitle}</span>
              </button>
              {index === currentIndex ? <span className="sr-only">{t("mediaPlayer.nowPlaying")}</span> : null}
              <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-30" aria-label={t("mediaPlayer.moveQueueUp")}><ChevronUp className="size-4" /></button>
              <button type="button" disabled={index === queue.length - 1} onClick={() => onMove(index, index + 1)} className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-secondary disabled:opacity-30" aria-label={t("mediaPlayer.moveQueueDown")}><ChevronDown className="size-4" /></button>
              <button type="button" disabled={index === currentIndex} onClick={() => onRemove(index)} className="flex size-8 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30" aria-label={t("mediaPlayer.removeQueueItem")}><Trash2 className="size-4" /></button>
            </div>
          ))}
          {!queue.length ? <p className="py-8 text-center text-sm text-muted-foreground">{t("mediaPlayer.queueEmpty")}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
