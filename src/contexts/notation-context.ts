import { createContext } from "react";
import type { NotationStyle } from "@/utils/noteNaming";

export interface NotationContextValue {
  notation: NotationStyle;
  setNotation: (notation: NotationStyle) => void;
}

export const NotationContext = createContext<NotationContextValue | null>(null);
