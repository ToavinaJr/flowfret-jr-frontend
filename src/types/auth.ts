export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface RegisterPendingResult {
  email: string;
  verificationToken: string;
  expiresAt: string;
  message: string;
}

export interface VerifyEmailInput {
  token: string;
  code: string;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
export type AuthMode = "login" | "register" | "verify" | "forgot" | "reset";
