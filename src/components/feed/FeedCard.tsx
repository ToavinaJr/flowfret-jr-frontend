import { useState } from "react";
import type { FeedComment, FeedPost } from "@/types/feed";
import { DetailsPost } from "./DetailsPost";
import { FeedCardContent } from "./FeedCardContent";
import { FeedCardHeader } from "./FeedCardHeader";
import { FeedComments } from "./FeedComments";
import { FeedLikeButton } from "./FeedLikeButton";

export interface FeedCardProps {
  post: FeedPost;
  onComment: (postId: string, content: string) => Promise<FeedComment>;
  currentUserId: string;
  onToggleLike: (post: FeedPost) => Promise<void>;
  onChanged: () => Promise<void>;
}

export function FeedCard({
  post,
  onComment,
  currentUserId,
  onToggleLike,
  onChanged,
}: FeedCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasImages = post.attachments.length > 0;

  return (
    <article
      onClick={(event) => {
        if (
          !(event.target as HTMLElement).closest(
            "button, input, textarea, a, [role='dialog']",
          )
        )
          setDetailsOpen(true);
      }}
      className={`flex cursor-pointer flex-col overflow-visible rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 sm:p-4 ${hasImages ? "h-[32rem]" : "h-auto"}`}
    >
      <FeedCardHeader
        post={post}
        currentUserId={currentUserId}
        onChanged={onChanged}
      />
      <FeedCardContent post={post} />
      <DetailsPost
        post={post}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <FeedComments
        post={post}
        currentUserId={currentUserId}
        onComment={onComment}
        onChanged={onChanged}
        leadingAction={
          <FeedLikeButton post={post} onToggleLike={onToggleLike} />
        }
      />
    </article>
  );
}
