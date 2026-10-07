import "@testing-library/jest-dom/vitest";
import "@/i18n";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// With `isolate: false` in vitest.config.ts, test files share a module
// registry, so React Testing Library's own auto-registered `afterEach`
// (wired once, at first import) only ends up attached to whichever file
// happens to import it first - every other file never gets its DOM cleaned
// between tests. Registering it explicitly here (setupFiles run per file)
// makes cleanup actually run for every test in every file.
afterEach(cleanup);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

Element.prototype.scrollIntoView = () => undefined;
