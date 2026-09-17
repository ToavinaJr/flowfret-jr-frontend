# flowfret-jr

React + Vite frontend for FretFlow.

## Setup

```bash
cp .env.example .env.development
bun install
bun run dev
```

Package manager in use: **bun**.

## Production configuration

Set `VITE_GRAPHQL_URL` to the public HTTPS API endpoint at build time, for
example `https://api.fretflow.app/graphql`. Application initialization fails
in production when this variable is missing or uses HTTP. Vercel no longer
proxies API traffic to an unencrypted IP address.

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
