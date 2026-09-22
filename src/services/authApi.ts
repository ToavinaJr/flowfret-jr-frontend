import type { AuthSession, LoginInput, RegisterInput, RegisterPendingResult, VerifyEmailInput } from "@/types/auth";
import { graphqlRequest } from "@/services/graphqlClient";
import { clearAuthSession, setAuthSession } from "@/services/authToken";

type AuthPayload = { accessToken: string; user: { id: string; username: string; email: string; role: "USER" | "ADMIN" } };

function persistSession(session: AuthSession): AuthSession {
  setAuthSession({ accessToken: session.accessToken, userId: session.user.id, username: session.user.username, email: session.user.email });
  return session;
}

export async function loginUser(data: LoginInput): Promise<AuthSession> {
  const result = await graphqlRequest<{ login: AuthPayload }>({ query: `mutation LoginUser($data: LoginInput!) { login(data: $data) { accessToken user { id username email role } } }`, variables: { data } });
  return persistSession({ accessToken: result.login.accessToken, user: result.login.user });
}

export async function registerUser(data: RegisterInput): Promise<RegisterPendingResult> {
  const result = await graphqlRequest<{ register: RegisterPendingResult }>({ query: `mutation RegisterUser($data: RegisterInput!) { register(data: $data) { email verificationToken expiresAt message } }`, variables: { data } });
  return result.register;
}

export async function verifyEmailUser(data: VerifyEmailInput): Promise<AuthSession> {
  const result = await graphqlRequest<{ verifyEmail: AuthPayload }>({ query: `mutation VerifyEmail($data: VerifyEmailInput!) { verifyEmail(data: $data) { accessToken user { id username email role } } }`, variables: { data } });
  return persistSession({ accessToken: result.verifyEmail.accessToken, user: result.verifyEmail.user });
}

export async function loginWithGoogleUser(accessToken: string): Promise<AuthSession> {
  const result = await graphqlRequest<{ loginWithGoogle: AuthPayload }>({ query: `mutation LoginWithGoogle($data: GoogleAuthInput!) { loginWithGoogle(data: $data) { accessToken user { id username email role } } }`, variables: { data: { accessToken } } });
  return persistSession({ accessToken: result.loginWithGoogle.accessToken, user: result.loginWithGoogle.user });
}

export async function registerWithGoogleUser(accessToken: string): Promise<AuthSession> {
  const result = await graphqlRequest<{ registerWithGoogle: AuthPayload }>({ query: `mutation RegisterWithGoogle($data: GoogleAuthInput!) { registerWithGoogle(data: $data) { accessToken user { id username email role } } }`, variables: { data: { accessToken } } });
  return persistSession({ accessToken: result.registerWithGoogle.accessToken, user: result.registerWithGoogle.user });
}

export async function resendVerificationEmail(token: string): Promise<RegisterPendingResult> {
  const result = await graphqlRequest<{ resendVerificationEmail: RegisterPendingResult }>({ query: `mutation ResendVerificationEmail($token: String!) { resendVerificationEmail(token: $token) { email verificationToken expiresAt message } }`, variables: { token } });
  return result.resendVerificationEmail;
}

export async function restoreSession(): Promise<AuthSession> {
  const result = await graphqlRequest<{ refreshSession: AuthPayload }>({ query: `mutation RestoreSession { refreshSession { accessToken user { id username email role } } }` });
  return persistSession({ accessToken: result.refreshSession.accessToken, user: result.refreshSession.user });
}

export async function logoutUser(): Promise<void> {
  await graphqlRequest({ query: `mutation Logout { logout }` }).catch(() => undefined);
  clearAuthSession();
}

export async function requestPasswordReset(email: string): Promise<void> {
  await graphqlRequest({ query: `mutation RequestPasswordReset($data: RequestPasswordResetInput!) { requestPasswordReset(data: $data) }`, variables: { data: { email } } });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await graphqlRequest({ query: `mutation ResetPassword($data: ResetPasswordInput!) { resetPassword(data: $data) }`, variables: { data: { token, password } } });
}
