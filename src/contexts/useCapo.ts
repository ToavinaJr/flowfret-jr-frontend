import { useContext } from "react";
import { CapoContext } from "./capo-context";

export function useCapo() {
  const context = useContext(CapoContext);
  if (!context) throw new Error("useCapo must be used within CapoProvider");
  return context;
}
