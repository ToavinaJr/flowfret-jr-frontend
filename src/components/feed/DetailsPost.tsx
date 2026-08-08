import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FeedPost } from "@/types/feed";

interface DetailsPostProps { post: FeedPost; open: boolean; onOpenChange: (open: boolean) => void }

export function DetailsPost({ post, open, onOpenChange }: DetailsPostProps) {
  const { t } = useTranslation();
  const [activeImage, setActiveImage] = useState(0);
  const images = post.attachments.map(({ upload }) => upload.storagePath);
  useEffect(() => { if (open) setActiveImage(0); }, [open, post.id]);
  const move = (direction: number) => setActiveImage((current) => (current + direction + images.length) % images.length);

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="flex max-h-[92vh] w-[calc(100%-1rem)] max-w-4xl flex-col overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
      <DialogHeader className="border-b border-border px-5 py-4 text-left">
        <DialogTitle>{t("postDetails.title", { username: post.author.username })}</DialogTitle>
        <DialogDescription>{t("postDetails.imageCount", { count: images.length })}</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 overflow-y-auto">
        {images.length > 0 && <div className="relative flex min-h-[280px] items-center justify-center bg-black sm:min-h-[420px]">
          <img src={images[activeImage]} alt={t("postDetails.imageAlt", { current: activeImage + 1, total: images.length })} className="max-h-[62vh] w-full object-contain" />
          {images.length > 1 && <><button type="button" onClick={() => move(-1)} aria-label={t("postDetails.previous")} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-black/65 text-white backdrop-blur hover:bg-black/80"><ChevronLeft /></button><button type="button" onClick={() => move(1)} aria-label={t("postDetails.next")} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-black/65 text-white backdrop-blur hover:bg-black/80"><ChevronRight /></button><span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs text-white">{activeImage + 1}/{images.length}</span></>}
        </div>}
        {images.length > 1 && <div className="flex gap-2 overflow-x-auto border-b border-border p-3">{images.map((src, index) => <button key={`${src}-${index}`} type="button" onClick={() => setActiveImage(index)} aria-label={t("postDetails.openImage", { number: index + 1 })} className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${activeImage === index ? "border-primary" : "border-transparent"}`}><img src={src} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        {post.content && <p className="whitespace-pre-wrap break-words px-5 py-5 text-sm leading-6 text-foreground sm:text-base">{post.content}</p>}
      </div>
    </DialogContent>
  </Dialog>;
}
