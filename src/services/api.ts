import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  RegisterPendingResult,
  VerifyEmailInput,
} from "@/types/auth";
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
      email
      verificationToken
      expiresAt
      message
    }
  }
`;

const VERIFY_EMAIL_MUTATION = `
  mutation VerifyEmail($data: VerifyEmailInput!) {
    verifyEmail(data: $data) {
      accessToken
      user { id username email }
    }
  }
`;

const RESEND_VERIFICATION_MUTATION = `
  mutation ResendVerificationEmail($token: String!) {
    resendVerificationEmail(token: $token) {
      email
      verificationToken
      expiresAt
      message
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

function persistSession(session: AuthSession): AuthSession {
  setAuthSession({
    accessToken: session.accessToken,
    userId: session.user.id,
    username: session.user.username,
    email: session.user.email,
  });
  return session;
}

export async function loginUser(data: LoginInput): Promise<AuthSession> {
  const result = await graphqlRequest<{ login: AuthPayload }>({
    query: LOGIN_MUTATION,
    variables: { data },
  });
  return persistSession({
    accessToken: result.login.accessToken,
    user: result.login.user,
  });
}

export async function registerUser(
  data: RegisterInput,
): Promise<RegisterPendingResult> {
  const result = await graphqlRequest<{ register: RegisterPendingResult }>({
    query: REGISTER_MUTATION,
    variables: { data },
  });
  return result.register;
}

export async function verifyEmailUser(
  data: VerifyEmailInput,
): Promise<AuthSession> {
  const result = await graphqlRequest<{ verifyEmail: AuthPayload }>({
    query: VERIFY_EMAIL_MUTATION,
    variables: { data },
  });
  return persistSession({
    accessToken: result.verifyEmail.accessToken,
    user: result.verifyEmail.user,
  });
}

export async function resendVerificationEmail(
  token: string,
): Promise<RegisterPendingResult> {
  const result = await graphqlRequest<{
    resendVerificationEmail: RegisterPendingResult;
  }>({
    query: RESEND_VERIFICATION_MUTATION,
    variables: { token },
  });
  return result.resendVerificationEmail;
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
