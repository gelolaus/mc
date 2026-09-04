# JPCS-APC Minecraft

The permanent Minecraft world of the JPCS-APC community. This repository is a pnpm and Turborepo monorepo with two independently deployed Vercel projects.

## Architecture

`Minecraft bridge → NestJS ingestion API → PostgreSQL → NestJS public API → Next.js`

The bridge pushes public-safe state to the API. Browsers never query Minecraft, RCON, or PostgreSQL directly. NestJS owns the application data boundary.

## Requirements and local setup

Use Node.js 22 or later, pnpm 11, and a PostgreSQL database. Copy `.env.example` to `.env` and set `DATABASE_URL`, `MINECRAFT_INGEST_SECRET`, and `WORLD_CREATED_AT`. Keep all secrets out of `NEXT_PUBLIC_*` variables.

```powershell
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

The web app runs on `http://localhost:3000`; the API runs on `http://localhost:3001`. `pnpm build`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` run across the workspace. The seed command is blocked when `NODE_ENV=production` and provides clearly local mock records only.

## Database and world configuration

Prisma stores players by immutable `minecraftUuid`, never by username. `firstJoinedAt` is set only on creation. Set `WORLD_CREATED_AT` once to the permanent world creation time. Uptime derives from a Minecraft process `serverStartedAt`; world age derives from the stored world creation date.

Run `pnpm db:migrate` to create the schema. Use a serverless PostgreSQL provider such as Neon for Vercel production.

## Minecraft bridge

The Velocity bridge is in `plugins/velocity-bridge`. It tracks successful backend membership for `lobby`, `survival`, and `creative`; a proxy login by itself does not create a player. Configure the exact Velocity backend names with `lobby-server`, `survival-server`, and `creative-server`. The bridge sends HTTPS JSON with `Authorization: Bearer <MINECRAFT_INGEST_SECRET>`.

| Endpoint | Purpose |
| --- | --- |
| `POST /v1/ingest/heartbeat` | `{ serverKey, serverStartedAt, version, playersOnline, playersMax, onlinePlayers: [{ uuid, username }] }` every 30 seconds |
| `POST /v1/ingest/players/join` | `{ uuid, username, joinedAt, serverKey }` after the first successful backend connection |
| `POST /v1/ingest/players/quit` | `{ uuid, username, leftAt, sessionPlaytimeSeconds }` |
| `POST /v1/ingest/server/start` | `{ serverStartedAt, version? }` |
| `POST /v1/ingest/server/stop` | graceful shutdown notification |

The heartbeat timeout is `MINECRAFT_HEARTBEAT_TIMEOUT_SECONDS`, defaulting to 120 seconds. A stale heartbeat makes the public API return `online: false`, null current counts, and null uptime. Rotate the ingest secret by replacing it in the bridge and API environment together, then restarting the bridge.

## Public API

`GET /v1/server`, `GET /v1/world`, `GET /v1/players`, `GET /v1/players/new`, and `GET /v1/players/:uuidOrUsername` are read-only. Player listing accepts `search`, `online=true`, and `sort` values: `recentlyJoined`, `firstJoined`, `recentlySeen`, `playtime`, or `alphabetical`.

## Vercel

Create two Vercel projects pointing at this monorepo. Set the first root directory to `apps/web` and attach `mc.jpcs-apc.org`; set the second root directory to `apps/api` and attach `api.mc.jpcs-apc.org`. Add database and Minecraft secret variables only to the API project. Add `NEXT_PUBLIC_API_URL=https://api.mc.jpcs-apc.org` and, optionally, `NEXT_PUBLIC_WORLD_MAP_URL` to the web project. Vercel does not need persistent process memory; all durable state is in PostgreSQL.
