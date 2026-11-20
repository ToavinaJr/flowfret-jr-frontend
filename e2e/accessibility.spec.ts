import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("public landing page has no WCAG A/AA accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("body")).not.toBeEmpty();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    results.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      elements: nodes.map(({ target }) => target),
    })),
  ).toEqual([]);
});
