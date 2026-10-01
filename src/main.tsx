import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

const preloadReloadKey = "flowfret-vite-preload-reload";
const preloadReloadWindowMs = 30_000;

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();

  let lastReload = 0;
  try {
    lastReload = Number(sessionStorage.getItem(preloadReloadKey));
  } catch {
    // Continue with a reload when browser storage is unavailable.
  }
  if (
    Number.isFinite(lastReload) &&
    lastReload > 0 &&
    Date.now() - lastReload < preloadReloadWindowMs
  ) {
    return;
  }

  try {
    sessionStorage.setItem(preloadReloadKey, String(Date.now()));
  } catch {
    // The one-reload guard is best-effort when browser storage is unavailable.
  }
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
