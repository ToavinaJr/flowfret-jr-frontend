# flowfret-jr

React + Vite frontend for FretFlow.

## Setup

```bash
cp .env.example .env.development
bun install
bun run dev
```

Package manager in use: **bun**.

## Music search

- Route: `/music`
- Uses backend GraphQL `searchMusic` via `src/services/musicGraphql.ts`
- No Spotify/Genius secrets in the frontend
- Preview audio is shown only when `previewUrl` is present

## Scripts

```bash
bun run dev
bun run lint
bun run build
bun run test
```
