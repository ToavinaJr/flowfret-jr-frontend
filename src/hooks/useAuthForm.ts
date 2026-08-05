import { useCallback, useMemo, useState } from "react";
import type { AuthMode } from "@/types/auth";

export function useAuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [pendingAction, setPendingAction] = useState<"submit" | "google" | "resend" | null>(null);
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    otp: "",
  });

  const setField = useCallback(<K extends keyof typeof formState>(field: K, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({ email: "", password: "", confirmPassword: "", username: "", otp: "" });
    setPendingAction(null);
  }, []);

  const isPending = useMemo(
    () => pendingAction === "submit" || pendingAction === "google" || pendingAction === "resend",
    [pendingAction],
  );

  return {
    mode,
    setMode,
    pendingAction,
    setPendingAction,
    formState,
    setField,
    resetForm,
    isPending,
  };
}
