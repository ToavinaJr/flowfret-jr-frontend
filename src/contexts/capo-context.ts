import { createContext } from "react";

export interface CapoContextValue {
  capo: number;
  setCapo: (capo: number) => void;
}

export const CapoContext = createContext<CapoContextValue | null>(null);
