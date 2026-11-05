import { expect, test, type Locator, type Page } from "@playwright/test";

function wave(frequency = 440, seconds = 8) {
  const rate = 22050;
  const samples = rate * seconds;
  const data = Buffer.alloc(44 + samples * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(data.length - 8, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(rate, 24);
  data.writeUInt32LE(rate * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin((2 * Math.PI * frequency * i) / rate);
    data.writeInt16LE(Math.round(2500 * sample), 44 + i * 2);
  }
  return data;
}

async function seekTo(page: Page, seek: Locator, time: number) {
  await seek.evaluate((element, value) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, time);
}

async function openLoopPanel(page: Page) {
  const player = page.getByRole("region", { name: "Audio player" });
  await player.getByRole("button", { name: "Configure practice loop" }).click();
  return { player, panel: page.getByRole("region", { name: "Practice loop" }) };
}

for (const width of [320, 1280]) {
  test(`uploaded audio loops a selected passage at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.addInitScript(() => localStorage.setItem("fretflow-language", "en"));
    await page.route("**/graphql", async (route) => {
      const query = route.request().postDataJSON()?.query ?? "";
      const user = { id: "test-user", username: "player", email: "player@example.test", role: "USER", status: "ACTIVE" };
      const data = /RestoreSession|RefreshSession/.test(query)
        ? { refreshSession: { accessToken: "test-token", user } }
        : query.includes("UnreadNotificationCount")
          ? { unreadNotificationCount: 0 }
          : {};
      await route.fulfill({ json: { data } });
    });
    await page.goto("/upload");
    await page.locator('input[name="audioFile"]').setInputFiles({
      name: "practice.wav",
      mimeType: "audio/wav",
      buffer: wave(440),
    });

    const player = page.getByRole("region", { name: "Audio player" });
    await expect(player).toBeVisible({ timeout: 15_000 });
    await expect(player.getByText("practice")).toBeVisible();
    const seek = player.locator(
      `input[name="playbackPosition${width < 640 ? "Mobile" : "Desktop"}"]`,
    );
    await expect.poll(async () => Number(await seek.getAttribute("max"))).toBeGreaterThan(5);
    const { panel } = await openLoopPanel(page);

    await seekTo(page, seek, 1.5);
    await panel.getByRole("button", { name: "Set A" }).click();
    await seekTo(page, seek, 3.5);
    await panel.getByRole("button", { name: "Set B" }).click();
    await expect(panel.getByRole("button", { name: "Disable loop" })).toBeEnabled();
    await expect(seek.locator("xpath=..").getByTestId("practice-loop-markers").locator("span")).toHaveCount(3);

    await player.getByRole("button", { name: "Play", exact: true }).click();
    await expect.poll(async () => Number(await seek.inputValue()), { timeout: 8_000 }).toBeLessThan(3.3);
    await player.getByRole("button", { name: "Pause", exact: true }).click();
    await expect(panel.getByRole("button", { name: "Disable loop" })).toBeEnabled();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`direct player clears loop when the track changes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.route("**/graphql", async (route) => {
      const query = route.request().postDataJSON()?.query ?? "";
      const user = { id: "test-user", username: "player", email: "player@example.test", role: "USER", status: "ACTIVE" };
      const data = /RestoreSession|RefreshSession/.test(query)
        ? { refreshSession: { accessToken: "test-token", user } }
        : query.includes("UnreadNotificationCount")
          ? { unreadNotificationCount: 0 }
          : {};
      await route.fulfill({ json: { data } });
    });
    await page.route("https://audio.example.test/**", (route) => route.fulfill({
      contentType: "audio/wav",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: wave(),
    }));
    await page.addInitScript(() => {
      const item = {
        id: "direct-one",
        engine: "audio",
        src: "https://audio.example.test/one.wav",
        title: "Direct track",
        subtitle: "Artist",
        duration: 8,
      };
      localStorage.setItem("fretflow-language", "en");
      localStorage.setItem("fretflow.playback.session.v1", JSON.stringify({
        item,
        queue: [item, { ...item, id: "direct-two", src: "https://audio.example.test/two.wav", title: "Next track" }],
        currentIndex: 0,
        currentTime: 0,
        volume: 1,
        shuffle: false,
      }));
    });
    await page.goto("/help");
    const player = page.getByRole("region", { name: "Audio player" });
    const seek = player.locator(
      `input[name="playbackPosition${width < 640 ? "Mobile" : "Desktop"}"]`,
    );
    await expect(player.getByText("Direct track")).toBeVisible();
    await player.getByRole("button", { name: "Play", exact: true }).click();
    await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0.3);
    const { panel } = await openLoopPanel(page);
    await panel.getByRole("button", { name: "Set A" }).click();
    await expect(panel.getByRole("button", { name: "Set B" })).toBeEnabled({ timeout: 3_000 });
    await panel.getByRole("button", { name: "Set B" }).click();
    await expect(panel.getByRole("button", { name: "Disable loop" })).toBeEnabled();
    await player.getByRole("button", { name: "Pause", exact: true }).click();

    await player.getByRole("button", { name: "Next track" }).click();
    await expect(player.getByText("Next track")).toBeVisible();
    await expect(panel.getByText("A: — · B: —")).toBeVisible();
    await expect(panel.getByRole("button", { name: "Enable loop" })).toBeDisabled();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
