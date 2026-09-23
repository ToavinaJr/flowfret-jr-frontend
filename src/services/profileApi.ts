import type { FeedPost } from "@/types/feed";
import { graphqlRequest } from "@/services/graphqlClient";
import { PROFILE_VISIBILITY, type ProfileVisibility } from "@/constants/domain";

export interface SocialUser {
  id: string;
  username: string;
  profile?: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
}
export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  visibility: ProfileVisibility;
  user: { id: string; username: string; authoredPosts: FeedPost[] };
}

export async function fetchMyProfile(
  userId: string,
): Promise<UserProfile | null> {
  const fields = `id username authoredPosts { id content likeCount commentCount viewerHasLiked viewerLikeId createdAt author { id username profile { avatarUrl } } mentionedUsers { id username profile { avatarUrl } } attachments { id upload { id storagePath } } }`;
  const result = await graphqlRequest<{
    profileByUserId: UserProfile | null;
    user: UserProfile["user"] | null;
  }>({
    query: `query UserProfile($userId: String!) { profileByUserId(userId: $userId) { id userId displayName avatarUrl bio visibility user { ${fields} } } user(id: $userId) { ${fields} } }`,
    variables: { userId },
  });
  if (result.profileByUserId) return result.profileByUserId;
  return result.user
    ? {
        id: "",
        userId,
        displayName: result.user.username,
        avatarUrl: null,
        bio: null,
        visibility: PROFILE_VISIBILITY.PUBLIC,
        user: result.user,
      }
    : null;
}

export async function saveProfile(
  data: {
    displayName: string;
    bio: string;
    visibility: ProfileVisibility;
    avatarUrl?: string | null;
  },
  profileId?: string,
): Promise<void> {
  const payload = {
    displayName: data.displayName.trim(),
    bio: data.bio.trim() || null,
    visibility: data.visibility,
    ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
  };
  if (
    !payload.displayName ||
    payload.displayName.length > 120 ||
    data.bio.length > 1000
  )
    throw new Error("Profil invalide.");
  await graphqlRequest({
    query: profileId
      ? `mutation UpdateProfile($id: String!, $data: UpdateProfileInput!) { updateProfile(id: $id, data: $data) { id } }`
      : `mutation CreateProfile($data: CreateProfileInput!) { createProfile(data: $data) { id } }`,
    variables: profileId
      ? { id: profileId, data: payload }
      : { data: payload },
  });
}

export async function saveProfileImage(
  username: string,
  avatarUrl: string,
  profileId?: string,
): Promise<void> {
  if (!avatarUrl.startsWith("https://"))
    throw new Error("URL d’image invalide.");
  await graphqlRequest({
    query: profileId
      ? `mutation SetAvatar($id: String!, $data: UpdateProfileInput!) { updateProfile(id: $id, data: $data) { id } }`
      : `mutation CreateProfile($data: CreateProfileInput!) { createProfile(data: $data) { id } }`,
    variables: profileId
      ? { id: profileId, data: { avatarUrl } }
      : { data: { displayName: username, avatarUrl } },
  });
}
