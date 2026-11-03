import { expect, test } from "@playwright/test";

// Short generated PCM fixtures exercise real browser decoding and Web Audio.
function wave(frequency: number) {
  const rate = 22050;
  const samples = rate * 20;
  const data = Buffer.alloc(44 + samples * 2);
  data.write("RIFF", 0); data.writeUInt32LE(data.length - 8, 4); data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(1, 22);
  data.writeUInt32LE(rate, 24); data.writeUInt32LE(rate * 2, 28);
  data.writeUInt16LE(2, 32); data.writeUInt16LE(16, 34);
  data.write("data", 36); data.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) data.writeInt16LE(Math.round(2000 * Math.sin(2 * Math.PI * frequency * i / rate)), 44 + i * 2);
  return data;
}

for (const width of [320, 768, 1280]) {
  test(`Equalizer preserves transport and fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await page.route("**/graphql", async (route) => {
      const query = route.request().postDataJSON()?.query ?? "";
      const user = { id: "test-user", username: "player", email: "player@example.test", role: "USER", status: "ACTIVE" };
      const data = /RestoreSession|RefreshSession/.test(query) ? { refreshSession: { accessToken: "test-token", user } } : {};
      await route.fulfill({ json: { data } });
    });
    await page.route("https://audio.example.test/**", (route) => route.fulfill({
      contentType: "audio/wav", headers: { "Access-Control-Allow-Origin": "*" },
      body: wave(route.request().url().includes("vocals") ? 440 : 220),
    }));
    let creations = 0;
    await page.route("**/api/audio-stems**", async (route) => {
      const creating = route.request().method() === "POST";
      if (creating) creations++;
      await route.fulfill({ json: {
        audioStemId: "11111111-1111-4111-8111-111111111111", status: creating ? "DOWNLOADING" : "COMPLETED", progress: creating ? 0 : 100,
        vocalsUrl: creating ? null : "https://audio.example.test/vocals.wav",
        instrumentalUrl: creating ? null : "https://audio.example.test/instrumental.wav",
      } });
    });
    await page.addInitScript(() => {
      const item = { id: "AUDIUS:one", engine: "audio", provider: "AUDIUS", providerTrackId: "one", src: "https://audio.example.test/original.wav", title: "Practice track", subtitle: "Artist", duration: 20 };
      localStorage.setItem("fretflow-language", "en");
      localStorage.setItem("fretflow.playback.session.v1", JSON.stringify({ item, queue: [item, { ...item, id: "AUDIUS:two", providerTrackId: "two", title: "Next track" }], currentIndex: 0, currentTime: 2, volume: 0.5, shuffle: false }));
    });
    await page.goto("/help");
    const player = page.getByRole("region", { name: "Audio player" });
    const seek = player.locator(`input[name="playbackPosition${width < 640 ? "Mobile" : "Desktop"}"]`);
    await player.getByRole("button", { name: "Play", exact: true }).click();
    await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(0.3);
    await player.getByRole("button", { name: "Pause", exact: true }).click();
    const positionBeforeRemoval = Number(await seek.inputValue());
    await player.getByRole("button", { name: /Equalizer:/ }).click();
    const dialog = page.getByRole("dialog", { name: "Equalizer" });
    const removal = dialog.getByRole("slider");
    await expect(removal).toBeDisabled();
    await dialog.getByRole("button", { name: "Prepare tracks" }).click();
    await expect(dialog.getByText(/Downloading the audio source/)).toBeVisible();
    await expect(dialog.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    await expect(removal).toBeEnabled({ timeout: 15000 });
    expect(creations).toBe(1);
    await removal.focus();
    await removal.press("End");
    await expect(removal).toHaveValue("100");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press("Escape");
    await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(positionBeforeRemoval - 0.2);
    await player.getByRole("button", { name: "Play", exact: true }).click();
    await expect.poll(async () => Number(await seek.inputValue())).toBeGreaterThan(positionBeforeRemoval + 0.3);
    await player.getByRole("button", { name: "Pause", exact: true }).click();
    await seek.focus();
    await seek.press("Home");
    await expect(seek).toHaveValue("0");
    await player.getByRole("button", { name: /Equalizer:/ }).click();
    await expect(removal).toHaveValue("100");
    await removal.focus();
    await removal.press("Home");
    await expect(removal).toHaveValue("0");
    await page.keyboard.press("Escape");
    await player.getByRole("button", { name: "Next track" }).click();
    await player.getByRole("button", { name: /Equalizer:/ }).click();
    await expect(dialog.getByRole("button", { name: "Prepare tracks" })).toBeVisible();
    await expect(removal).toBeDisabled();
  });
}
