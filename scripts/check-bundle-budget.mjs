import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const assetsDirectory = fileURLToPath(new URL("../dist/assets/", import.meta.url));
const budgets = {
  totalBytes: 2 * 1024 * 1024,
  largestFileBytes: 450 * 1024,
};

async function collectAssets(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const assets = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      assets.push(...(await collectAssets(path)));
    } else if (/\.(?:js|css)$/.test(entry.name)) {
      assets.push({ path, size: (await stat(path)).size });
    }
  }

  return assets;
}

const assets = await collectAssets(assetsDirectory);
if (assets.length === 0) {
  throw new Error("No JavaScript or CSS assets found in dist/assets.");
}

const totalBytes = assets.reduce((total, asset) => total + asset.size, 0);
const largestAsset = assets.reduce((largest, asset) =>
  asset.size > largest.size ? asset : largest,
);

console.info(
  `Frontend bundle: ${(totalBytes / 1024 / 1024).toFixed(2)} MiB across ${assets.length} JS/CSS assets; largest ${largestAsset.path.split(/[\\/]/).at(-1)} (${(largestAsset.size / 1024).toFixed(1)} KiB).`,
);

const violations = [];
if (totalBytes > budgets.totalBytes) {
  violations.push(
    `Total JS/CSS size ${(totalBytes / 1024).toFixed(1)} KiB exceeds ${(budgets.totalBytes / 1024).toFixed(0)} KiB.`,
  );
}
if (largestAsset.size > budgets.largestFileBytes) {
  violations.push(
    `Largest asset ${largestAsset.path.split(/[\\/]/).at(-1)} (${(largestAsset.size / 1024).toFixed(1)} KiB) exceeds ${(budgets.largestFileBytes / 1024).toFixed(0)} KiB.`,
  );
}

if (violations.length > 0) {
  throw new Error(violations.join("\n"));
}
