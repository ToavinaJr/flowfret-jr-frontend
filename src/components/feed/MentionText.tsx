import { Link } from "react-router-dom";
import type { FeedAuthor } from "@/types/feed";
import { mentionSegments } from "@/utils/mentions";

interface MentionTextProps {
  content: string;
  mentionedUsers: FeedAuthor[];
  className?: string;
}

export function MentionText({
  content,
  mentionedUsers,
  className,
}: MentionTextProps) {
  return (
    <span className={className}>
      {mentionSegments(content, mentionedUsers).map((segment, index) =>
        segment.user ? (
          <Link
            key={`${index}-${segment.user.id}`}
            to={`/profile/${segment.user.id}`}
            className="font-semibold text-primary hover:underline"
          >
            {segment.text}
          </Link>
        ) : (
          segment.text
        ),
      )}
    </span>
  );
}
