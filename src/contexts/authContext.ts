import { createContext } from "react";
import type {
  AuthStatus,
  AuthUser,
  LoginInput,
  RegisterInput,
  RegisterPendingResult,
  VerifyEmailInput,
} from "@/types/auth";

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (data: LoginInput) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  registerWithGoogle: (accessToken: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<RegisterPendingResult>;
  verifyEmail: (data: VerifyEmailInput) => Promise<void>;
  resendVerification: (token: string) => Promise<RegisterPendingResult>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
