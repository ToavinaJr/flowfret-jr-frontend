import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AuthStatus,
  AuthUser,
  LoginInput,
  RegisterInput,
  RegisterPendingResult,
  VerifyEmailInput,
} from "@/types/auth";
import {
  getAccessToken,
  getCurrentUserEmail,
  getCurrentUserId,
  getCurrentUsername,
} from "@/services/authToken";
import {
  loginUser,
  loginWithGoogleUser,
  logoutUser,
  registerUser,
  resendVerificationEmail,
  verifyEmailUser,
} from "@/services/api";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (data: LoginInput) => Promise<void>;
  loginWithGoogle: (accessToken: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<RegisterPendingResult>;
  verifyEmail: (data: VerifyEmailInput) => Promise<void>;
  resendVerification: (token: string) => Promise<RegisterPendingResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  const id = getCurrentUserId();
  const username = getCurrentUsername();
  const email = getCurrentUserEmail();
  const token = getAccessToken();
  if (!id || !username || !email || !token) return null;
  return { id, username, email };
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const stored = readStoredUser();
    setUser(stored);
    setStatus(stored ? "authenticated" : "unauthenticated");
  }, []);

  const login = useCallback(async (data: LoginInput) => {
    const session = await loginUser(data);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const loginWithGoogle = useCallback(async (accessToken: string) => {
    const session = await loginWithGoogleUser(accessToken);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    return registerUser(data);
  }, []);

  const verifyEmail = useCallback(async (data: VerifyEmailInput) => {
    const session = await verifyEmailUser(data);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const resendVerification = useCallback(async (token: string) => {
    return resendVerificationEmail(token);
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      loginWithGoogle,
      register,
      verifyEmail,
      resendVerification,
      logout,
    }),
    [
      status,
      user,
      login,
      loginWithGoogle,
      register,
      verifyEmail,
      resendVerification,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
