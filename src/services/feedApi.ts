import type { CreateCommentInput, CreatePostInput, FeedComment, FeedPost } from "@/types/feed";
import { graphqlRequest } from "@/services/graphqlClient";

export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const result = await graphqlRequest<{ posts: FeedPost[] }>({ query: `query GetFeedPosts { posts { id content likeCount commentCount createdAt author { id username profile { avatarUrl } } likes { id userId } attachments { id upload { id storagePath } } } }` });
  return result.posts;
}

export async function fetchFeedPost(id: string): Promise<FeedPost | null> {
  const result = await graphqlRequest<{ post: FeedPost | null }>({ query: `query FeedPost($id: String!) { post(id: $id) { id content likeCount commentCount createdAt author { id username profile { avatarUrl } } likes { id userId } attachments { id upload { id storagePath } } } }`, variables: { id } });
  return result.post;
}

export async function createFeedPost(data: CreatePostInput): Promise<FeedPost> {
  const result = await graphqlRequest<{ createPost: FeedPost }>({ query: `mutation CreateFeedPost($data: CreatePostInput!) { createPost(data: $data) { id content likeCount commentCount createdAt author { id username profile { avatarUrl } } comments { id content createdAt author { id username } } } }`, variables: { data } });
  return result.createPost;
}

export async function createFeedComment(data: CreateCommentInput): Promise<{ id: string; content: string; createdAt: string; author: { id: string; username: string }; post: { id: string } }> {
  const result = await graphqlRequest<{ createComment: { id: string; content: string; createdAt: string; author: { id: string; username: string }; post: { id: string } } }>({ query: `mutation CreateComment($data: CreateCommentInput!) { createComment(data: $data) { id content createdAt author { id username } post { id } } }`, variables: { data } });
  return result.createComment;
}

export async function fetchPostComments(postId: string, skip = 0, take = 20): Promise<FeedComment[]> {
  const result = await graphqlRequest<{ commentsByPost: FeedComment[] }>({ query: `query PostComments($postId: String!, $skip: Int!, $take: Int!) { commentsByPost(postId: $postId, skip: $skip, take: $take) { id content createdAt author { id username profile { avatarUrl } } } }`, variables: { postId, skip, take } });
  return result.commentsByPost;
}

export async function createFeedLike(postId: string, userId: string): Promise<void> {
  await graphqlRequest({ query: `mutation LikePost($data: CreatePostLikeInput!) { createPostLike(data: $data) { id } }`, variables: { data: { postId, userId } } });
}

export async function deleteFeedLike(id: string): Promise<void> {
  await graphqlRequest({ query: `mutation UnlikePost($id: String!) { deletePostLike(id: $id) { id } }`, variables: { id } });
}

export async function updateFeedPost(id: string, content: string): Promise<void> {
  if (!id || content.length > 10000) throw new Error("Publication invalide.");
  await graphqlRequest({ query: `mutation UpdateFeedPost($id: String!, $data: UpdatePostInput!) { updatePost(id: $id, data: $data) { id } }`, variables: { id, data: { content: content.trim() } } });
}

export async function deleteFeedPost(id: string): Promise<void> {
  if (!id) throw new Error("Publication invalide.");
  await graphqlRequest({ query: `mutation DeleteFeedPost($id: String!) { deletePost(id: $id) { id } }`, variables: { id } });
}

export async function updateFeedComment(id: string, content: string): Promise<void> {
  if (!id || !content.trim()) throw new Error("Commentaire invalide.");
  await graphqlRequest({ query: `mutation UpdateFeedComment($id: String!, $data: UpdateCommentInput!) { updateComment(id: $id, data: $data) { id } }`, variables: { id, data: { content: content.trim() } } });
}

export async function deleteFeedComment(id: string): Promise<void> {
  if (!id) throw new Error("Commentaire invalide.");
  await graphqlRequest({ query: `mutation DeleteFeedComment($id: String!) { deleteComment(id: $id) { id } }`, variables: { id } });
}
