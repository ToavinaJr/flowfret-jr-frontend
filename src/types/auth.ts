export interface AuthUser {
  id: string;
  username: string;
  email: string;
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

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
