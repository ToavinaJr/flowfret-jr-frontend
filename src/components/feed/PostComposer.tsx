import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MentionInput } from "@/components/feed/MentionInput";

const MAX_IMAGES = 12;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface Props { pending: boolean; onSubmit: (content: string, images: File[]) => Promise<void> }

export function PostComposer({ pending, onSubmit }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const previews = useMemo(() => images.map((file) => ({ file, url: URL.createObjectURL(file) })), [images]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

  function selectImages(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const invalid = selected.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_BYTES);
    if (invalid) { setSelectionError(t("feed.imageValidation")); event.target.value = ""; return; }
    const unique = selected.filter((file) => !images.some((current) => current.name === file.name && current.size === file.size && current.lastModified === file.lastModified));
    if (images.length + unique.length > MAX_IMAGES) setSelectionError(t("feed.imageLimit", { count: MAX_IMAGES }));
    else setSelectionError(null);
    setImages((current) => [...current, ...unique].slice(0, MAX_IMAGES));
    event.target.value = "";
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setSelectionError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!content.trim() && !images.length) return;
    try { await onSubmit(content, images); setContent(""); setImages([]); if (inputRef.current) inputRef.current.value = ""; }
    catch { /* The mutation displays the translated error toast. */ }
  }

  return <form onSubmit={submit} className="mb-4 space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
    <MentionInput value={content} onChange={setContent} placeholder={t("feed.composerPlaceholder")} rows={3} maxLength={10000} className="w-full resize-none rounded-md border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span>{t("feed.mentionHint")}</span>
    </div>
    {previews.length > 0 && <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {previews.map(({ file, url }, index) => <div key={`${file.name}-${file.size}-${file.lastModified}`} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
        <img src={url} alt={t("feed.imagePreviewAlt", { number: index + 1 })} className="h-full w-full object-cover" />
        <button type="button" disabled={pending} onClick={() => removeImage(index)} aria-label={t("feed.removeImage", { number: index + 1 })} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white shadow transition-colors hover:bg-destructive disabled:opacity-50"><X className="h-4 w-4" /></button>
      </div>)}
    </div>}
    {selectionError && <p role="alert" className="text-xs text-destructive">{selectionError}</p>}
    <div className="flex flex-wrap items-center gap-3">
      <input ref={inputRef} id="post-images" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={pending || images.length >= MAX_IMAGES} onChange={selectImages} className="sr-only" />
      <label htmlFor="post-images" aria-disabled={pending || images.length >= MAX_IMAGES} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-3 text-sm text-foreground hover:bg-surface-hover aria-disabled:pointer-events-none aria-disabled:opacity-50"><ImagePlus className="h-4 w-4" />{t("feed.addImages")}</label>
      <span className="text-xs text-muted-foreground">{t("feed.selectedImages", { count: images.length, max: MAX_IMAGES })}</span>
      <button type="submit" disabled={pending || (!content.trim() && !images.length)} className="ml-auto min-h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50">{t(pending ? "feed.publishing" : "feed.publish")}</button>
    </div>
  </form>;
}
