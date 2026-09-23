import { useState } from "react";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FeedPost } from "@/types/feed";

interface FeedLikeButtonProps {
  post: FeedPost;
  onToggleLike: (post: FeedPost) => Promise<void>;
}

export function FeedLikeButton({ post, onToggleLike }: FeedLikeButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const isLiked = post.viewerHasLiked;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onToggleLike(post);
        } finally {
          setLoading(false);
        }
      }}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 transition-colors disabled:opacity-50 ${isLiked ? "text-primary" : "hover:bg-secondary hover:text-foreground"}`}
      aria-pressed={isLiked}
      aria-label={isLiked ? t("feed.removeReaction") : t("feed.reactToPost")}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span>
        {post.likeCount} {post.likeCount <= 1 ? t("feed.like") : t("feed.likes")}
      </span>
    </button>
  );
}
