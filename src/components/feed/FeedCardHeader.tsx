import { useState } from "react";
import { Flag, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { deleteFeedPost } from "@/services/api";
import type { FeedPost } from "@/types/feed";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EditPostDialog } from "./EditPostDialog";
import { formatRelative } from "./feed-format";
import { ReportPostDialog } from "./ReportPostDialog";
import { UserAvatar } from "@/components/common/UserAvatar";

interface FeedCardHeaderProps {
  post: FeedPost;
  currentUserId: string;
  onChanged: () => Promise<void>;
}

export function FeedCardHeader({
  post,
  currentUserId,
  onChanged,
}: FeedCardHeaderProps) {
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const isOwner = post.author.id === currentUserId;

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <Link
          to={`/profile/${post.author.id}`}
          className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UserAvatar
            src={post.author.avatarUrl}
            name={post.author.username}
            alt={t("friends.avatarAlt", { name: post.author.username })}
            size="sm"
          />
          <div className="min-w-0">
            <div className="truncate text-sm text-foreground hover:underline">
              {post.author.username}
            </div>
            <div className="font-musical text-xs text-muted-foreground">
              {formatRelative(post.createdAt, t)}
            </div>
          </div>
        </Link>
        {isOwner ? (
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              aria-label={t("feed.editPost")}
              onClick={() => setEditOpen(true)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <DeleteConfirmationDialog
              entity="post"
              onConfirm={async () => {
                await deleteFeedPost(post.id);
                await onChanged();
              }}
              trigger={
                <button
                  type="button"
                  aria-label={t("deleteDialog.post.trigger")}
                  className="min-h-11 min-w-11 rounded-md p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
            aria-label={t("feed.reportPost")}
          >
            <Flag className="h-4 w-4" />
          </button>
        )}
      </div>
      <EditPostDialog
        post={post}
        open={editOpen}
        onOpenChange={setEditOpen}
        onChanged={onChanged}
      />
      <ReportPostDialog
        postId={post.id}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </>
  );
}
