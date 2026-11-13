import { expect, test } from "@playwright/test";

for (const width of [375, 768, 1280]) {
  test(`chord timeline remains readable and seekable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => localStorage.setItem("fretflow-language", "en"));
    await page.route("**/graphql", route => route.fulfill({ json: { data: {} } }));
    await page.goto("/");
    await page.evaluate(async () => {
      const load = (path: string) => import(path);
      const { default: React } = await load("/node_modules/.vite/deps/react.js");
      const { default: ReactDOM } = await load("/node_modules/.vite/deps/react-dom_client.js");
      const { ImportedSongPlayer } = await load("/src/components/features/music/ImportedSongPlayer.tsx");
      const { PlaybackContext } = await load("/src/contexts/playback-context.ts");
      const { CapoProvider } = await load("/src/contexts/CapoContext.tsx");
      document.getElementById("root")!.style.display = "none";
      document.documentElement.classList.add("dark");
      const host = document.createElement("div");
      host.style.cssText = "max-width:1024px;margin:auto;padding:16px";
      document.body.append(host);
      const song = { uri: "blob:test", meta: { title: "Practice progression", duration: 25,
        cues: ["C", "G", "Am", "F", "C"].map((chord, index) => ({ chord, start: index * 5, end: (index + 1) * 5 })),
      } };
      const select = () => {};
      function Harness() {
        const [currentTime, seek] = React.useState(10);
        return React.createElement(PlaybackContext.Provider, { value: { item: { id: "import:blob:test" }, currentTime, select, seek } },
          React.createElement(CapoProvider, null, React.createElement(ImportedSongPlayer, { song }),
            React.createElement("button", { onClick: () => seek(25) }, "Finish playback")));
      }
      ReactDOM.createRoot(host).render(React.createElement(Harness));
    });
    const timeline = page.getByRole("region", { name: "Chord timeline" });
    const player = page.getByRole("region", { name: "Chords for Practice progression" });
    const chordLibrary = player.getByRole("region", { name: "All chords" });
    await expect(timeline.getByRole("button")).toHaveCount(width === 375 ? 2 : 5);
    await expect(chordLibrary.getByRole("button")).toHaveCount(4);
    await expect(timeline.getByRole("button", { name: "Play Am at 0:10" })).toHaveAttribute("aria-current", "true");
    await expect(timeline.getByRole("button", { name: "Play F at 0:15" })).toBeVisible();
    const [playerBox, timelineBox, chordLibraryBox] = await Promise.all([
      player.boundingBox(),
      timeline.boundingBox(),
      chordLibrary.boundingBox(),
    ]);
    expect(playerBox).not.toBeNull();
    expect(timelineBox).not.toBeNull();
    expect(chordLibraryBox).not.toBeNull();
    expect(chordLibraryBox!.width).toBeGreaterThanOrEqual(playerBox!.width - 2);
    expect(chordLibraryBox!.y).toBeGreaterThanOrEqual(
      timelineBox!.y + timelineBox!.height,
    );
    const diagramBoxes = await timeline.locator("svg:visible").evaluateAll((diagrams) =>
      diagrams.map((diagram) => {
        const box = diagram.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      }),
    );
    expect(diagramBoxes.length).toBe(width === 375 ? 2 : 5);
    for (const diagramBox of diagramBoxes) {
      expect(diagramBox.left).toBeGreaterThanOrEqual(timelineBox!.x - 1);
      expect(diagramBox.right).toBeLessThanOrEqual(timelineBox!.x + timelineBox!.width + 1);
      expect(diagramBox.top).toBeGreaterThanOrEqual(timelineBox!.y - 1);
      expect(diagramBox.bottom).toBeLessThanOrEqual(timelineBox!.y + timelineBox!.height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Up one semitone", exact: true }).click();
    await page.getByRole("button", { name: "Up one semitone", exact: true }).click();
    await expect(timeline.locator('button[aria-current="true"]')).toHaveAccessibleName("Play Bm at 0:10");
    await page.getByLabel("Capo", { exact: true }).selectOption("2");
    await expect(timeline.locator('button[aria-current="true"]')).toHaveAccessibleName("Play Am at 0:10");
    await page.getByRole("button", { name: "Restore original key" }).click();
    await page.getByLabel("Capo", { exact: true }).selectOption("0");
    await page.screenshot({ path: testInfo.outputPath(`upcoming-${width}.png`), fullPage: true, animations: "disabled" });
    await timeline.getByRole("button", { name: "Play F at 0:15" }).click();
    await expect(timeline.getByRole("button", { name: "Play F at 0:15" })).toHaveAttribute("aria-current", "true");
    await timeline.getByRole("button", { name: "Play C at 0:20" }).click();
    await expect(timeline.getByRole("button", { name: "Play C at 0:20" })).toHaveAttribute("aria-current", "true");
    await page.getByRole("button", { name: "Finish playback" }).click();
    await expect(timeline.getByRole("button", { name: "Play C at 0:20" })).toHaveAttribute("aria-current", "true");
  });
}
