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

const LOGIN_WITH_GOOGLE_MUTATION = `
  mutation LoginWithGoogle($data: GoogleAuthInput!) {
    loginWithGoogle(data: $data) {
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

const REQUEST_PASSWORD_RESET_MUTATION = `
  mutation RequestPasswordReset($data: RequestPasswordResetInput!) {
    requestPasswordReset(data: $data)
  }
`;

const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($data: ResetPasswordInput!) {
    resetPassword(data: $data)
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
      likes { id userId }
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

export async function loginWithGoogleUser(
  accessToken: string,
): Promise<AuthSession> {
  const result = await graphqlRequest<{ loginWithGoogle: AuthPayload }>({
    query: LOGIN_WITH_GOOGLE_MUTATION,
    variables: { data: { accessToken } },
  });
  return persistSession({
    accessToken: result.loginWithGoogle.accessToken,
    user: result.loginWithGoogle.user,
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

export async function requestPasswordReset(email: string): Promise<void> {
  await graphqlRequest({
    query: REQUEST_PASSWORD_RESET_MUTATION,
    variables: { data: { email } },
  });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await graphqlRequest({
    query: RESET_PASSWORD_MUTATION,
    variables: { data: { token, password } },
  });
}

export async function createFeedLike(postId: string, userId: string): Promise<void> {
  await graphqlRequest({
    query: `mutation LikePost($data: CreatePostLikeInput!) { createPostLike(data: $data) { id } }`,
    variables: { data: { postId, userId } },
  });
}

export async function deleteFeedLike(id: string): Promise<void> {
  await graphqlRequest({
    query: `mutation UnlikePost($id: String!) { deletePostLike(id: $id) { id } }`,
    variables: { id },
  });
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

export async function updateFeedPost(id: string, content: string): Promise<void> {
  if (!id || !content.trim()) throw new Error("Publication invalide.");
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
