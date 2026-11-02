import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:8081';
const email = process.env.E2E_EMAIL ?? 'alex.riffs@example.com';
const password = process.env.E2E_PASSWORD ?? 'dev-password';
const outputDirectory = 'playwright-output';
const events = [];

function record(type, details) {
  const entry = { type, ...details };
  events.push(entry);
  console.log(JSON.stringify(entry));
}

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  locale: 'fr-FR',
  permissions: [],
});
const page = await context.newPage();

page.on('console', (message) => {
  if (['error', 'warning'].includes(message.type())) {
    record('browser.console', {
      level: message.type(),
      text: message.text(),
    });
  }
});

page.on('pageerror', (error) => {
  record('browser.pageerror', { message: error.message });
});

page.on('requestfailed', (request) => {
  record('browser.requestfailed', {
    method: request.method(),
    url: request.url(),
    error: request.failure()?.errorText,
  });
});

page.on('response', async (response) => {
  if (!response.url().includes('/transcriptions')) return;
  let body = '';
  try {
    body = (await response.text()).slice(0, 4_000);
  } catch (error) {
    body = `<unreadable: ${error instanceof Error ? error.message : String(error)}>`;
  }
  record('transcription.response', {
    method: response.request().method(),
    status: response.status(),
    url: response.url(),
    body,
  });
});

try {
  await page.goto(`${baseUrl}/music`, { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /se connecter/i }).click();
  await page.locator('#music-search-query').waitFor({ timeout: 15_000 });
  record('auth.completed', { url: page.url() });

  await page.locator('#music-search-query').fill('guitar');
  await page.locator('#music-search-query').press('Enter');
  const firstTrack = page.locator('h3').first();
  await firstTrack.waitFor({ timeout: 20_000 });
  record('music.search.completed', {
    firstTrack: (await firstTrack.textContent())?.trim() ?? null,
  });

  const playButton = page.getByRole('button', { name: /^Lire /i }).first();
  await playButton.click();
  await page.waitForTimeout(8_000);

  const transcriptionSection = page.locator('section[aria-label^="Transcription de"]').first();
  await transcriptionSection.waitFor({ timeout: 10_000 });
  const sectionText = (await transcriptionSection.innerText()).trim();
  const alerts = await page.getByRole('alert').allInnerTexts();
  record('transcription.ui', { sectionText, alerts });

  await page.screenshot({
    path: `${outputDirectory}/transcription-diagnostic.png`,
    fullPage: true,
  });
} catch (error) {
  record('diagnostic.failed', {
    message: error instanceof Error ? error.message : String(error),
    url: page.url(),
    body: (await page.locator('body').innerText().catch(() => '')).slice(0, 4_000),
  });
  await page.screenshot({
    path: `${outputDirectory}/transcription-diagnostic-failed.png`,
    fullPage: true,
  });
  process.exitCode = 1;
} finally {
  await browser.close();
}
