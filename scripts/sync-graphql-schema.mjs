// Copies the backend's exported GraphQL schema into this repository.
//
// The frontend repository is built on its own (Vercel, CI), so codegen reads the committed
// ./schema.graphql and never reaches into a sibling checkout. Run this after the backend schema
// changes (`bun run graphql:schema` in the backend), then `bun run graphql:codegen`, and commit
// schema.graphql together with src/generated/graphql.ts.
import { copyFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(new URL("../../backend/schema.graphql", import.meta.url));
const target = fileURLToPath(new URL("../schema.graphql", import.meta.url));

try {
  await access(source);
} catch {
  console.error(`Backend schema not found at ${source}. Check out the backend repository next to this one.`);
  process.exit(1);
}

await copyFile(source, target);
console.log("Updated schema.graphql from the backend schema.");
