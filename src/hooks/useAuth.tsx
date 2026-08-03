import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthStatus, AuthUser, LoginInput, RegisterInput } from "@/types/auth";
import {
  getAccessToken,
  getCurrentUserEmail,
  getCurrentUserId,
  getCurrentUsername,
} from "@/services/authToken";
import { loginUser, logoutUser, registerUser } from "@/services/api";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
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

  const register = useCallback(async (data: RegisterInput) => {
    const session = await registerUser(data);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
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
