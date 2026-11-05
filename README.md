# FlowFret frontend

React + TypeScript + Vite client for FlowFret. The product feature overview is
in the [project README](../README.md).

The authenticated workspace includes music search and playback, lyrics and
chord cues when available, A/B practice looping, supported vocal reduction,
local audio chord analysis, chord and scale references, tuner, metronome,
playlists, transcription history, teaching, and social features. Public landing
page content is translated in both `src/i18n/locales/en/translation.json` and
`src/i18n/locales/fr/translation.json`.

Build-time public configuration is centralized in `src/config/runtime.ts`;
never expose backend secrets through `VITE_*` values.

## Administration

Administrators can open `/admin`, which uses a dedicated responsive layout and
role guard. The overview consumes `adminDashboardStatistics`; separate routes
list members, posts, transcriptions, playlists, and audit logs with search and
cursor pagination. Post reports remain available under
`/admin/content/reports`. The legacy `/moderation` URL redirects there.

## Setup

```bash
cp .env.example .env.development
bun install
bun run dev
```

Package manager in use: **bun**.

## Production configuration

Set `VITE_GRAPHQL_URL` to the public HTTPS API endpoint at build time, for
example `https://api.flowfret.app/graphql`. Application initialization fails
in production when this variable is missing or uses HTTP. Vercel no longer
proxies API traffic to an unencrypted IP address.
When changing the production API host, add its HTTPS origin to the
`connect-src` directive in `vercel.json` and redeploy the frontend so the
Content Security Policy permits browser requests to that API.

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
