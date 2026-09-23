import { graphqlRequest } from "./graphqlClient";

export interface AccountSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export async function fetchAccountSessions(): Promise<AccountSession[]> {
  const data = await graphqlRequest<{ mySessions: AccountSession[] }>({
    query: `query MySessions { mySessions { id createdAt expiresAt current } }`,
  });
  return data.mySessions;
}

export async function revokeAccountSession(id: string): Promise<void> {
  await graphqlRequest<{ revokeSession: boolean }>({
    query: `mutation RevokeSession($id: String!) { revokeSession(id: $id) }`,
    variables: { id },
  });
}

export async function changeAccountPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await graphqlRequest<{ changePassword: boolean }>({
    query: `mutation ChangePassword($data: ChangePasswordInput!) { changePassword(data: $data) }`,
    variables: { data: { currentPassword, newPassword } },
  });
}

export async function deleteAccount(
  currentPassword: string,
  confirmation: string,
): Promise<void> {
  await graphqlRequest<{ deleteMyAccount: boolean }>({
    query: `mutation DeleteMyAccount($data: DeleteAccountInput!) { deleteMyAccount(data: $data) }`,
    variables: {
      data: { currentPassword: currentPassword || undefined, confirmation },
    },
  });
}
