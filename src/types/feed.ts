export interface FeedAuthor {
  id: string;
  username: string;
  profile?: { avatarUrl: string | null } | null;
}

export interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  mentionedUsers: FeedAuthor[];
  likes?: Array<{ id: string; userId: string }>;
  isDeleted?: boolean;
}

export interface FeedPost {
  id: string;
  content: string;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  viewerLikeId: string | null;
  createdAt: string;
  author: FeedAuthor;
  comments?: FeedComment[];
  attachments: Array<{ id: string; upload: { id: string; storagePath: string } }>;
  mentionedUsers: FeedAuthor[];
  isDeleted?: boolean;
}

export interface CreatePostInput {
  content?: string;
  imageUploadIds?: string[];
}

export interface CreateCommentInput {
  content: string;
  postId: string;
}
