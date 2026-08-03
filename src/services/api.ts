import type { AuthSession, LoginInput, RegisterInput } from "@/types/auth";
import type { CreateCommentInput, CreatePostInput, FeedPost } from "@/types/feed";
import { graphqlRequest } from "@/services/graphqlClient";
import { setAuthSession, clearAuthSession } from "@/services/authToken";

const LOGIN_MUTATION = `
  mutation LoginUser($data: LoginInput!) {
    login(data: $data) {
      accessToken
      user { id username email }
    }
  }
`;

const REGISTER_MUTATION = `
  mutation RegisterUser($data: RegisterInput!) {
    register(data: $data) {
      accessToken
      user { id username email }
    }
  }
`;

const FEED_QUERY = `
  query GetFeedPosts {
    posts {
      id content likeCount commentCount createdAt
      author { id username }
      comments {
        id content createdAt
        author { id username }
      }
    }
  }
`;

const CREATE_POST_MUTATION = `
  mutation CreateFeedPost($data: CreatePostInput!) {
    createPost(data: $data) {
      id content likeCount commentCount createdAt
      author { id username }
      comments { id content createdAt author { id username } }
    }
  }
`;

const CREATE_COMMENT_MUTATION = `
  mutation CreateComment($data: CreateCommentInput!) {
    createComment(data: $data) {
      id content createdAt
      author { id username }
      post { id }
    }
  }
`;

interface AuthPayload {
  accessToken: string;
  user: { id: string; username: string; email: string };
}

export async function loginUser(data: LoginInput): Promise<AuthSession> {
  const result = await graphqlRequest<{ login: AuthPayload }>({
    query: LOGIN_MUTATION,
    variables: { data },
  });
  const session: AuthSession = {
    accessToken: result.login.accessToken,
    user: result.login.user,
  };
  setAuthSession({
    accessToken: session.accessToken,
    userId: session.user.id,
    username: session.user.username,
    email: session.user.email,
  });
  return session;
}

export async function registerUser(data: RegisterInput): Promise<AuthSession> {
  const result = await graphqlRequest<{ register: AuthPayload }>({
    query: REGISTER_MUTATION,
    variables: { data },
  });
  const session: AuthSession = {
    accessToken: result.register.accessToken,
    user: result.register.user,
  };
  setAuthSession({
    accessToken: session.accessToken,
    userId: session.user.id,
    username: session.user.username,
    email: session.user.email,
  });
  return session;
}

export function logoutUser(): void {
  clearAuthSession();
}

export async function fetchFeedPosts(): Promise<FeedPost[]> {
  const result = await graphqlRequest<{ posts: FeedPost[] }>({
    query: FEED_QUERY,
  });
  return result.posts;
}

export async function createFeedPost(data: CreatePostInput): Promise<FeedPost> {
  const result = await graphqlRequest<{ createPost: FeedPost }>({
    query: CREATE_POST_MUTATION,
    variables: { data },
  });
  return result.createPost;
}

export async function createFeedComment(data: CreateCommentInput): Promise<{
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string };
  post: { id: string };
}> {
  const result = await graphqlRequest<{
    createComment: {
      id: string;
      content: string;
      createdAt: string;
      author: { id: string; username: string };
      post: { id: string };
    };
  }>({
    query: CREATE_COMMENT_MUTATION,
    variables: { data },
  });
  return result.createComment;
}
