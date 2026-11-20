import { useContext } from "react";
import { NotationContext } from "./notation-context";

export function useNotation() {
  const context = useContext(NotationContext);
  if (!context) throw new Error("useNotation must be used within NotationProvider");
  return context;
}
