import {
  useCallback,
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
  VerifyEmailInput,
} from "@/types/auth";
import {
  loginUser,
  loginWithGoogleUser,
  registerWithGoogleUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  restoreSession,
  resendVerificationEmail,
  verifyEmailUser,
} from "@/services/api";
import { clearPlaybackSession } from "@/services/playbackSession";
import { AUTH_SESSION_CLEARED_EVENT } from "@/services/authToken";
import { AuthContext } from "./authContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const handleSessionCleared = () => {
      clearPlaybackSession();
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);
    return () => {
      window.removeEventListener(
        AUTH_SESSION_CLEARED_EVENT,
        handleSessionCleared,
      );
    };
  }, []);

  useEffect(() => {
    let active = true;
    void restoreSession()
      .then((session) => {
        if (!active) return;
        setUser(session.user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        clearPlaybackSession();
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
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

  const register = useCallback(
    async (data: RegisterInput) => {
      const session = await registerUser(data);
      setUser(session.user);
      setStatus("authenticated");
    },
    [],
  );

  const verifyEmail = useCallback(async (data: VerifyEmailInput) => {
    const session = await verifyEmailUser(data);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const resendVerification = useCallback(
    async (token: string) => resendVerificationEmail(token),
    [],
  );

  const registerWithGoogle = useCallback(async (accessToken: string) => {
    const session = await registerWithGoogleUser(accessToken);
    setUser(session.user);
    setStatus("authenticated");
  }, []);

  const requestReset = useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const completeReset = useCallback(async (token: string, password: string) => {
    await resetPassword(token, password);
  }, []);

  const logout = useCallback(async () => {
    clearPlaybackSession();
    setUser(null);
    setStatus("unauthenticated");
    await logoutUser();
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      loginWithGoogle,
      registerWithGoogle,
      register,
      verifyEmail,
      resendVerification,
      requestPasswordReset: requestReset,
      resetPassword: completeReset,
      logout,
    }),
    [
      status,
      user,
      login,
      loginWithGoogle,
      registerWithGoogle,
      register,
      verifyEmail,
      resendVerification,
      requestReset,
      completeReset,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
