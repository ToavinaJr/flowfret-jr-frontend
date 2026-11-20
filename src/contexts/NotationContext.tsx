import { useMemo, useState, type ReactNode } from "react";
import { DEFAULT_NOTATION, isNotationStyle, type NotationStyle } from "@/utils/noteNaming";
import { NotationContext, type NotationContextValue } from "./notation-context";

const STORAGE_KEY = "flowfret.notation.v1";

function readSavedNotation(): NotationStyle {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isNotationStyle(value) ? value : DEFAULT_NOTATION;
  } catch {
    return DEFAULT_NOTATION;
  }
}

export function NotationProvider({ children }: { children: ReactNode }) {
  const [notation, setNotationState] = useState(readSavedNotation);
  const value = useMemo<NotationContextValue>(
    () => ({
      notation,
      setNotation: (next) => {
        if (!isNotationStyle(next)) return;
        setNotationState(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* Storage is optional. */
        }
      },
    }),
    [notation],
  );
  return <NotationContext.Provider value={value}>{children}</NotationContext.Provider>;
}
