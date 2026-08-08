export interface FeedAuthor {
  id: string;
  username: string;
}

export interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
  isDeleted?: boolean;
}

export interface FeedPost {
  id: string;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: FeedAuthor;
  comments?: FeedComment[];
  likes: Array<{ id: string; userId: string }>;
  attachments: Array<{ id: string; upload: { id: string; storagePath: string } }>;
  isDeleted?: boolean;
}

export interface CreatePostInput {
  content?: string;
  authorId: string;
  imageUploadIds?: string[];
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  authorId: string;
}
