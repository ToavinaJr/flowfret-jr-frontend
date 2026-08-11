import type {
  AuthSession,
  LoginInput,
  RegisterInput,
  RegisterPendingResult,
  VerifyEmailInput,
} from "@/types/auth";
import type { CreateCommentInput, CreatePostInput, FeedPost } from "@/types/feed";
import { graphqlRequest } from "@/services/graphqlClient";
import { setAuthSession, clearAuthSession, getAccessToken } from "@/services/authToken";
import { GRAPHQL_URL } from "@/services/backend";

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
      likes { id userId }
      attachments { id upload { id storagePath } }
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

export async function logoutUser(): Promise<void> {
  await graphqlRequest({ query: `mutation Logout { logout }` }).catch(
    () => undefined,
  );
  clearAuthSession();
}

export async function restoreSession(): Promise<AuthSession> {
  const result = await graphqlRequest<{ refreshSession: AuthPayload }>({
    query: `mutation RestoreSession { refreshSession { accessToken user { id username email } } }`,
  });
  return persistSession({
    accessToken: result.refreshSession.accessToken,
    user: result.refreshSession.user,
  });
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

export async function fetchPostComments(postId: string, skip = 0, take = 20) {
  const result = await graphqlRequest<{ commentsByPost: import('@/types/feed').FeedComment[] }>({
    query: `query PostComments($postId: String!, $skip: Int!, $take: Int!) { commentsByPost(postId: $postId, skip: $skip, take: $take) { id content createdAt author { id username profile { avatarUrl } } } }`,
    variables: { postId, skip, take },
  });
  return result.commentsByPost;
}

export async function uploadImages(files: File[]): Promise<Array<{ id: string; storagePath: string }>> {
  if (!files.length || files.length > 12) throw new Error('Sélectionnez entre 1 et 12 images.');
  const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
  if (files.some((file) => !allowed.has(file.type) || file.size > 8 * 1024 * 1024)) throw new Error('Images JPEG, PNG ou WebP uniquement, 8 Mo maximum.');
  const form = new FormData();
  files.forEach((file) => form.append('images', file));
  const token = getAccessToken();
  if (!token) throw new Error('Authentication required.');
  const uploadUrl = GRAPHQL_URL.replace(/\/graphql\/?$/, '/uploads/images');
  if (uploadUrl === GRAPHQL_URL) throw new Error('Invalid backend upload URL.');
  const response = await fetch(uploadUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message;
    throw new Error(message || `Image upload failed (${response.status}).`);
  }
  const payload = await response.json() as Array<{ id: string; storagePath: string }>;
  if (!Array.isArray(payload) || payload.length !== files.length) throw new Error('The backend returned an invalid upload response.');
  return payload;
}

export interface SocialUser { id: string; username: string; profile?: { id: string; displayName: string; avatarUrl: string | null; bio: string | null } | null }
export interface Friendship { id: string; requesterId: string; receiverId: string; status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED' | 'BLOCKED'; requester: SocialUser; receiver: SocialUser }
export interface UserProfile { id: string; userId: string; displayName: string; avatarUrl: string | null; bio: string | null; visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'; user: { id: string; username: string; authoredPosts: FeedPost[] } }

export async function fetchMyProfile(userId: string): Promise<UserProfile | null> {
  const fields = `id username authoredPosts { id content likeCount commentCount createdAt author { id username } likes { id userId } attachments { id upload { id storagePath } } }`;
  const result = await graphqlRequest<{ profileByUserId: UserProfile | null; user: UserProfile['user'] | null }>({ query: `query UserProfile($userId: String!) { profileByUserId(userId: $userId) { id userId displayName avatarUrl bio visibility user { ${fields} } } user(id: $userId) { ${fields} } }`, variables: { userId } });
  if (result.profileByUserId) return result.profileByUserId;
  return result.user ? { id: '', userId, displayName: result.user.username, avatarUrl: null, bio: null, visibility: 'PUBLIC', user: result.user } : null;
}

export async function saveProfile(userId: string, data: { displayName: string; bio: string; visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'; avatarUrl?: string }, profileId?: string) {
  const payload = { displayName: data.displayName.trim(), bio: data.bio.trim() || null, visibility: data.visibility, ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}) };
  if (!payload.displayName || payload.displayName.length > 120 || data.bio.length > 1000) throw new Error('Profil invalide.');
  await graphqlRequest({ query: profileId ? `mutation UpdateProfile($id: String!, $data: UpdateProfileInput!) { updateProfile(id: $id, data: $data) { id } }` : `mutation CreateProfile($data: CreateProfileInput!) { createProfile(data: $data) { id } }`, variables: profileId ? { id: profileId, data: payload } : { data: { ...payload, userId } } });
}

export async function searchUsers(query: string) { const result = await graphqlRequest<{ searchUsers: SocialUser[] }>({ query: `query FindUsers($query: String!) { searchUsers(query: $query) { id username profile { id displayName avatarUrl bio } } }`, variables: { query } }); return result.searchUsers; }
export async function fetchFriendships() { const result = await graphqlRequest<{ myFriendships: Friendship[] }>({ query: `query Friends { myFriendships { id requesterId receiverId status requester { id username profile { id displayName avatarUrl bio } } receiver { id username profile { id displayName avatarUrl bio } } } }` }); return result.myFriendships; }
export async function sendFriendRequest(receiverId: string) { await graphqlRequest({ query: `mutation AddFriend($receiverId: String!) { sendFriendRequest(receiverId: $receiverId) { id } }`, variables: { receiverId } }); }
export async function respondFriendRequest(id: string, accept: boolean) { await graphqlRequest({ query: `mutation RespondFriend($id: String!, $accept: Boolean!) { respondFriendRequest(id: $id, accept: $accept) { id } }`, variables: { id, accept } }); }
export async function removeFriend(id: string) { await graphqlRequest({ query: `mutation RemoveFriend($id: String!) { removeFriend(id: $id) { id } }`, variables: { id } }); }
export async function recordTrackListen(trackId: string) { if (!trackId || trackId.length > 255) return; await graphqlRequest({ query: `mutation TrackListened($action: String!, $entityType: String!, $entityId: String) { recordActivity(action: $action, entityType: $entityType, entityId: $entityId) { id } }`, variables: { action: 'TRACK_LISTENED', entityType: 'track', entityId: trackId } }); }

export async function saveProfileImage(userId: string, username: string, avatarUrl: string, profileId?: string): Promise<void> {
  if (!avatarUrl.startsWith('https://')) throw new Error('URL d’image invalide.');
  await graphqlRequest({
    query: profileId ? `mutation SetAvatar($id: String!, $data: UpdateProfileInput!) { updateProfile(id: $id, data: $data) { id } }` : `mutation CreateProfile($data: CreateProfileInput!) { createProfile(data: $data) { id } }`,
    variables: profileId ? { id: profileId, data: { avatarUrl } } : { data: { userId, displayName: username, avatarUrl } },
  });
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
