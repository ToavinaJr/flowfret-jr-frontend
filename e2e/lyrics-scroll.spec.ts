import { expect, test } from "@playwright/test";

for (const width of [375, 768, 1280]) {
  test(`lyrics never pull the page back at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    // Mount the real component with a controllable clock, without an external music service.
    await page.evaluate(async () => {
      const reactPath = "/node_modules/.vite/deps/react.js";
      const domPath = "/node_modules/.vite/deps/react-dom_client.js";
      const panelPath = "/src/components/features/music/LyricsPanel.tsx";
      const { default: React } = await import(reactPath);
      const { default: ReactDOM } = await import(domPath);
      const { LyricsPanel } = await import(panelPath);
      document.getElementById("root")!.style.display = "none";
      const host = document.createElement("div");
      document.body.append(host);
      function Harness() {
        const [time, setTime] = React.useState(0);
        return React.createElement("div", null,
          React.createElement("button", { style: { position: "fixed", right: 0, bottom: 0 }, onClick: () => setTime((value: number) => value + 5) }, "Advance lyrics"),
          React.createElement("div", { style: { height: 300 }, "data-testid": "lyrics-host" },
            React.createElement(LyricsPanel, { status: "success", currentTime: time, onSeek: () => {}, lyrics: {
              provider: "lrclib", synced: true, instrumental: false,
              lines: Array.from({ length: 50 }, (_, index) => ({ startTimeMs: index * 1000, text: `Lyric ${index}` })),
            } })),
          React.createElement("div", { style: { height: 2500 } }, "Other tracks"));
      }
      ReactDOM.createRoot(host).render(React.createElement(Harness));
    });
    const panel = page.getByTestId("lyrics-host").locator(".overflow-y-auto");
    await expect(panel).toBeVisible();
    await page.getByRole("button", { name: "Advance lyrics" }).click();
    await expect.poll(() => panel.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    await page.evaluate(() => window.scrollTo(0, 1000));
    const before = await panel.evaluate(element => element.scrollTop);
    await page.getByRole("button", { name: "Advance lyrics" }).click();
    await expect(page.getByRole("button", { name: "Lyric 10", exact: true })).toHaveClass(/font-semibold/);
    expect(await page.evaluate(() => window.scrollY)).toBe(1000);
    expect(await panel.evaluate(element => element.scrollTop)).toBe(before);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(() => panel.evaluate(element => element.scrollTop)).toBeGreaterThan(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
