export interface FeedAuthor {
  id: string;
  username: string;
}

export interface FeedComment {
  id: string;
  content: string;
  createdAt: string;
  author: FeedAuthor;
}

export interface FeedPost {
  id: string;
  content: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  author: FeedAuthor;
  comments: FeedComment[];
}

export interface CreatePostInput {
  content: string;
  authorId: string;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
  authorId: string;
}
