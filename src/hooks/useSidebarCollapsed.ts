import { useEffect, useState } from "react";

const STORAGE_KEY = "flowfret-sidebar-collapsed";

export function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Private browsing / storage quota - the toggle still works for this session.
    }
  }, [collapsed]);

  return [collapsed, setCollapsed];
}
