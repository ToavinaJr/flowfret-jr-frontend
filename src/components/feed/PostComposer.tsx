import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

interface Props { pending: boolean; onSubmit: (content: string, images: File[]) => Promise<void> }
export function PostComposer({ pending, onSubmit }: Props) {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  async function submit(event: FormEvent) { event.preventDefault(); if (!content.trim() && !images.length) return; try { await onSubmit(content, images); setContent(""); setImages([]); } catch { /* The mutation displays the translated error toast. */ } }
  return <form onSubmit={submit} className="mb-4 rounded-lg border border-border bg-card p-3 sm:p-4">
    <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder={t("feed.composerPlaceholder")} rows={3} maxLength={10000} className="w-full resize-none rounded-md border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
    <div className="mt-2 flex items-center gap-3"><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 6))} className="mr-auto max-w-[65%] text-xs text-muted-foreground" />
      <button type="submit" disabled={pending || (!content.trim() && !images.length)} className="min-h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">{t(pending ? "feed.publishing" : "feed.publish")}</button>
    </div>
  </form>;
}
