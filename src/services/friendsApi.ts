import { graphqlRequest } from "@/services/graphqlClient";
import type { SocialUser } from "@/services/profileApi";
import type { FriendshipStatus } from "@/constants/domain";

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendshipStatus;
  requester: SocialUser;
  receiver: SocialUser;
}

export async function searchUsers(query: string): Promise<SocialUser[]> {
  const result = await graphqlRequest<{ searchUsers: SocialUser[] }>({
    query: `query FindUsers($query: String!) { searchUsers(query: $query) { id username avatarUrl profile { id displayName avatarUrl bio } } }`,
    variables: { query },
  });
  return result.searchUsers;
}

export async function fetchFriendships(): Promise<Friendship[]> {
  const result = await graphqlRequest<{ myFriendships: Friendship[] }>({
    query: `query Friends { myFriendships { id requesterId receiverId status requester { id username avatarUrl profile { id displayName avatarUrl bio } } receiver { id username avatarUrl profile { id displayName avatarUrl bio } } } }`,
  });
  return result.myFriendships;
}

export async function sendFriendRequest(receiverId: string): Promise<void> {
  await graphqlRequest({
    query: `mutation AddFriend($receiverId: String!) { sendFriendRequest(receiverId: $receiverId) { id } }`,
    variables: { receiverId },
  });
}
export async function respondFriendRequest(
  id: string,
  accept: boolean,
): Promise<void> {
  await graphqlRequest({
    query: `mutation RespondFriend($id: String!, $accept: Boolean!) { respondFriendRequest(id: $id, accept: $accept) { id } }`,
    variables: { id, accept },
  });
}
export async function removeFriend(id: string): Promise<void> {
  await graphqlRequest({
    query: `mutation RemoveFriend($id: String!) { removeFriend(id: $id) { id } }`,
    variables: { id },
  });
}
