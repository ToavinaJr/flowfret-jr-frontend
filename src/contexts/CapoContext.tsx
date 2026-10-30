import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

const STORAGE_KEY = "flowfret.capo-fret.v1";
interface CapoContextValue { capo: number; setCapo: (capo: number) => void }
const CapoContext = createContext<CapoContextValue | null>(null);

function readSavedCapo(): number {
  try {
    const value = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(value) && value >= 0 && value <= 12 ? value : 0;
  } catch { return 0; }
}

export function CapoProvider({ children }: { children: ReactNode }) {
  const [capo, setCapoState] = useState(readSavedCapo);
  const value = useMemo<CapoContextValue>(() => ({
    capo,
    setCapo: (nextCapo) => {
      if (!Number.isInteger(nextCapo) || nextCapo < 0 || nextCapo > 12) return;
      setCapoState(nextCapo);
      try { window.localStorage.setItem(STORAGE_KEY, String(nextCapo)); } catch { /* Storage is optional. */ }
    },
  }), [capo]);
  return <CapoContext.Provider value={value}>{children}</CapoContext.Provider>;
}

export function useCapo(): CapoContextValue {
  const context = useContext(CapoContext);
  if (!context) throw new Error("useCapo must be used within CapoProvider");
  return context;
}
