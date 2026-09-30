import { expect, test, type Page } from "@playwright/test";

const user = {
  id: "user-1",
  email: "user@example.test",
  username: "player",
  displayName: "Player One",
  status: "ACTIVE",
  role: "ADMIN",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
  lastLoginAt: null,
  deletedAt: null,
  isDeleted: false,
  activity: { posts: 1, comments: 2, playlists: 0, uploads: 0 },
};

const statistics = {
  generatedAt: "2026-09-30T00:00:00.000Z",
  periodStart: "2026-09-01T00:00:00.000Z",
  periodEnd: "2026-09-30T23:59:59.999Z",
  days: 30,
  totals: {
    users: 10, activeUsers: 8, posts: 4, comments: 4, openReports: 1,
    uploads: 4, transcriptions: 4, chordTranscriptions: 4, playlists: 3,
    catalogTracks: 2, trackPlays: 10,
  },
  period: {
    newUsers: 1, newPosts: 2, newComments: 2, newUploads: 1,
    newTranscriptions: 1, reportsCreated: 1, trackPlays: 10,
  },
  daily: [{ date: "2026-09-01", users: 1, posts: 1, comments: 1, reports: 1, trackPlays: 1 }],
  usersByStatus: [{ key: "ACTIVE", count: 8 }, { key: "PENDING", count: 2 }],
  transcriptionsByStatus: [{ key: "FAILED", count: 1 }],
  playsByProvider: [{ key: "YOUTUBE", count: 1 }],
};

async function mockAdminApi(page: Page) {
  await page.route("**/graphql", async (route) => {
    const body = route.request().postDataJSON() as { query?: string };
    const query = body.query ?? "";
    let data: Record<string, unknown> = {};
    if (query.includes("RestoreSession") || query.includes("RefreshSession")) {
      data = { refreshSession: { accessToken: "test-token", user } };
    } else if (query.includes("AdminDashboardStatistics")) {
      data = { adminDashboardStatistics: statistics };
    } else if (query.includes("AdminBackendStatus")) {
      data = { adminBackendStatus: { databaseReachable: true, serverTime: "2026-09-30T00:00:00.000Z" } };
    } else if (query.includes("AdminManagedEntities")) {
      data = { adminManagedEntities: { nodes: [], totalCount: 0 } };
    } else if (query.includes("AdminInstructorProfiles")) {
      data = { adminInstructorProfiles: [{
        id: "teacher-1", userId: "user-1", status: "PENDING", headline: "Guitar teacher",
        biography: null, experienceYears: 4, specialties: [], languages: [], storageQuotaBytes: "536870912",
      }] };
    } else if (/query AdminUser\(/.test(query)) {
      data = { adminUser: user };
    } else if (query.includes("AdminUsers")) {
      data = { adminUsers: { nodes: [user], totalCount: 1, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminPosts")) {
      data = { adminPosts: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminUploads")) {
      data = { adminUploads: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminTranscriptions")) {
      data = { adminTranscriptions: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminCatalogTracks")) {
      data = { adminCatalogTracks: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminPlaylists")) {
      data = { adminPlaylists: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminListeningHistory")) {
      data = { adminListeningHistory: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminChordTranscriptions")) {
      data = { adminChordTranscriptions: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    } else if (query.includes("AdminAuditLogs")) {
      data = { adminAuditLogs: { nodes: [], totalCount: 0, pageInfo: { hasNextPage: false, hasPreviousPage: false, endCursor: null } } };
    }
    await route.fulfill({ json: { data } });
  });
}

async function expectCaretStable(locator: ReturnType<Page["locator"]>) {
  await locator.click();
  await locator.fill("abcdef");
  await locator.evaluate((node: HTMLInputElement | HTMLTextAreaElement) => node.setSelectionRange(3, 3));
  await locator.press("X");
  await expect(locator).toBeFocused();
  await expect(locator).toHaveValue("abcXdef");
  expect(await locator.evaluate((node: HTMLInputElement | HTMLTextAreaElement) => node.selectionStart)).toBe(4);
}

async function expectFocusStable(locator: ReturnType<Page["locator"]>) {
  await locator.click();
  await locator.fill("123456");
  await expect(locator).toBeFocused();
  await expect(locator).toHaveValue("123456");
}

test.beforeEach(async ({ page }) => {
  await mockAdminApi(page);
});

test("overview fits narrow screens and section cards have no numeric badges", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: /members by status/i })).toBeVisible();
  for (const width of [320, 360, 375, 390, 640, 768, 1024]) {
    await page.setViewportSize({ width, height: 850 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const chart = page.locator("div[style*='grid-template-columns']");
    await expect.poll(() => chart.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  }
  const sectionCards = page.locator("div.mt-8").filter({ has: page.getByRole("heading", { name: /management workflow/i }) }).locator("ul a[href^='/admin/']");
  await expect(sectionCards).toHaveCount(7);
  await expect(sectionCards.locator("span.rounded-full")).toHaveCount(0);
  const dayCount = page.getByRole("link", { name: /open 1 members for/i });
  await expect(dayCount).toHaveText("1");
  await dayCount.click();
  await expect(page).toHaveURL(/\/admin\/users\?from=2026-09-01&to=2026-09-01/);
  await expect(page.locator("input[type='date']").first()).toHaveValue("2026-09-01");
});

test("each daily chart value opens the filtered items for its metric", async ({ page }) => {
  const destinations = [
    { label: "Members", url: /\/admin\/users\?from=2026-09-01&to=2026-09-01/ },
    { label: "Posts", url: /\/admin\/content\?from=2026-09-01&to=2026-09-01/ },
    { label: "Comments", url: /\/admin\/data\?entity=COMMENT&from=2026-09-01&to=2026-09-01/ },
    { label: "Reports", url: /\/admin\/content\/reports\?from=2026-09-01&to=2026-09-01/ },
    { label: "Plays", url: /\/admin\/audit\?action=MUTATION_RECORDTRACKLISTEN&from=2026-09-01&to=2026-09-01/ },
  ];
  for (const destination of destinations) {
    await page.goto("/admin");
    await page.locator("#admin-trend-series").selectOption({ label: destination.label });
    const chart = page.locator("div[style*='grid-template-columns']");
    const dayCount = chart.getByRole("link").first();
    await expect(dayCount).toHaveText("1");
    await dayCount.click();
    await expect(page).toHaveURL(destination.url);
  }
});

test("dashboard metric and breakdown counts open their matching lists", async ({ page }) => {
  await page.goto("/admin");
  await page.getByRole("link", { name: "Open 10 items for Members" }).click();
  await expect(page).toHaveURL(/\/admin\/users$/);

  await page.goto("/admin");
  await page.getByRole("link", { name: "Open 2 items for New posts" }).click();
  await expect(page).toHaveURL(/\/admin\/content\?from=2026-09-01&to=2026-09-30/);

  await page.goto("/admin");
  await page.getByRole("link", { name: "Open 8 items for Active", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/users\?status=ACTIVE/);

  await page.goto("/admin");
  await page.getByRole("link", { name: "Open 1 items for Failed" }).click();
  await expect(page).toHaveURL(/\/admin\/media\?view=transcriptions&transcriptionStatus=FAILED/);

  await page.goto("/admin");
  await page.getByRole("link", { name: "Open 1 items for YouTube" }).click();
  await expect(page).toHaveURL(/\/admin\/music\?view=history&provider=YOUTUBE/);
});

test("search forms across admin lists keep focus and caret while typing", async ({ page }) => {
  for (const path of ["/admin/users", "/admin/content", "/admin/media", "/admin/music", "/admin/audit"]) {
    await page.goto(path);
    await expectCaretStable(page.locator("input[name='admin-search']"));
  }
});

test("entity editor, teacher quota and user action forms keep their caret", async ({ page }) => {
  await page.goto("/admin/data");
  await page.getByRole("button", { name: /create/i }).click();
  const editor = page.locator("form textarea");
  await expect(editor).toBeVisible();
  await expectCaretStable(editor);
  await expectCaretStable(page.locator("form input[required]"));

  await page.goto("/admin/teachers");
  await expectFocusStable(page.locator("input[name='quotaMiB']"));

  await page.goto("/admin/users/user-1");
  await page.getByRole("button", { name: /change role/i }).click();
  await expectCaretStable(page.locator("#admin-user-action-reason"));
});
