import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_NAV_SECTIONS,
} from "@/admin/adminNavigation";
import {
  MOBILE_TAB_ITEMS,
  MORE_PAGE_SECTIONS,
  NAV_SECTIONS,
  TOOL_NAV_ITEMS,
  isNavItemActive,
} from "./navigation";

const sidebarPaths = NAV_SECTIONS.flatMap((section) =>
  section.items.map((item) => item.path),
);

describe("app navigation", () => {
  it("lists each destination once in the sidebar", () => {
    expect(new Set(sidebarPaths).size).toBe(sidebarPaths.length);
  });

  it("keeps every previously reachable screen in the navigation", () => {
    const reachable = new Set([
      ...sidebarPaths,
      ...MOBILE_TAB_ITEMS.map((item) => item.path),
    ]);
    [
      "/",
      "/music",
      "/recommendations",
      "/stats",
      "/playlists",
      "/transcriptions",
      "/teaching",
      "/upload",
      "/friends",
      "/messages",
      "/notifications",
      "/chords",
      "/scales",
      "/tuner",
      "/metronome",
      "/profile",
      "/parametres",
      "/help",
      "/histoire",
      "/contact",
      "/menu",
    ].forEach((path) => expect(reachable.has(path)).toBe(true));
  });

  it("keeps the mobile bar within five destinations", () => {
    expect(MOBILE_TAB_ITEMS.length).toBeLessThanOrEqual(5);
  });

  it("makes every sidebar entry reachable on mobile (tab or More page)", () => {
    const moreOrTab = new Set([
      ...MOBILE_TAB_ITEMS.flatMap((item) => [item.path, ...(item.matchPaths ?? [])]),
      ...MORE_PAGE_SECTIONS.flatMap((section) => section.items.map((item) => item.path)),
    ]);
    sidebarPaths.forEach((path) => expect(moreOrTab.has(path)).toBe(true));
  });

  it("does not repeat bottom tabs on the More page", () => {
    const morePaths = MORE_PAGE_SECTIONS.flatMap((section) =>
      section.items.map((item) => item.path),
    );
    expect(morePaths).not.toContain("/music");
    expect(morePaths).not.toContain("/messages");
    TOOL_NAV_ITEMS.forEach((tool) => expect(morePaths).not.toContain(tool.path));
  });

  it("matches nested paths without matching sibling prefixes", () => {
    const music = MOBILE_TAB_ITEMS[1];
    expect(isNavItemActive(music, "/music/search")).toBe(true);
    expect(isNavItemActive(music, "/musical")).toBe(false);
    expect(isNavItemActive(MOBILE_TAB_ITEMS[0], "/music")).toBe(false);
  });
});

describe("admin navigation", () => {
  it("places every admin entry in exactly one section", () => {
    const grouped = ADMIN_NAV_SECTIONS.flatMap((section) => section.paths);
    expect([...grouped].sort()).toEqual(
      ADMIN_NAV_ITEMS.map((item) => item.path).sort(),
    );
  });
});
