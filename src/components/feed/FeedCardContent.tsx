import { useTranslation } from "react-i18next";
import type { FeedPost } from "@/types/feed";
import { MentionText } from "./MentionText";

export function FeedCardContent({ post }: { post: FeedPost }) {
  const { t } = useTranslation();
  const hasImages = post.attachments.length > 0;

  return (
    <>
      {post.content && (
        <MentionText
          content={post.content}
          mentionedUsers={post.mentionedUsers ?? []}
          className={`text-body mb-3 whitespace-pre-wrap break-words text-foreground ${hasImages ? "line-clamp-4" : "line-clamp-8"}`}
        />
      )}
      {hasImages && (
        <div className="mb-3 grid h-64 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-lg bg-secondary">
          {post.attachments.slice(0, 4).map((attachment, index) => (
            <div
              key={attachment.id}
              className={`relative overflow-hidden ${post.attachments.length === 1 ? "col-span-2" : ""}`}
            >
              <img
                src={attachment.upload.storagePath}
                alt={t("postDetails.previewAlt", { number: index + 1 })}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {index === 3 && post.attachments.length > 4 && (
                <span className="absolute inset-0 grid place-items-center bg-black/60 px-2 text-center text-lg font-semibold text-white">
                  {t("postDetails.morePhotos", {
                    count: post.attachments.length - 4,
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
