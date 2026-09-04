# Lobby Presence and Live Player Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record players after successful lobby entry and keep Lobby, Survival, Creative, player lists, and profiles synchronized with current API data.

**Architecture:** Velocity 1.0.5 tracks lobby as a backend and sends identified heartbeat membership for all three servers. NestJS accepts and exposes lobby state, while Next.js polls player and server data every 30 seconds. A guarded script cleans the single known false record.

**Tech Stack:** Java 25, Velocity 4.1 API, Gradle, NestJS 11, Prisma 6, Next.js 15, React 19, Vitest 3

**Spec:** `docs/superpowers/specs/2026-09-04-lobby-presence-and-live-player-data-design.md`

## Global Constraints

- A proxy login alone must never create a player.
- Only successful Lobby, Survival, or Creative backend membership counts.
- DiscordSRV controls verification; it is not a telemetry dependency.
- Browser refresh failures retain the most recent successful data.
- Do not stage, commit, push, deploy, or change production server configuration from this task.
- The user performs Git operations; Gemini performs host administration and deployment.

---

### Task 1: Accept and expose lobby state

**Files:**
- Modify: `apps/api/src/dto.ts`
- Modify: `apps/api/src/ingestion.service.ts`
- Modify: `apps/api/src/server.service.ts`
- Test: `apps/api/test/dto.spec.ts`
- Test: `apps/api/test/heartbeat-presence.spec.ts`
- Test: `apps/api/test/servers.spec.ts`

**Interfaces:**
- Consumes: `serverKey` strings from bridge events.
- Produces: `ServerKey = 'lobby' | 'survival' | 'creative'` behavior across ingestion and public state.

- [x] Add failing DTO tests that accept `lobby` for heartbeat, join, transfer, start, and stop events.
- [x] Run `pnpm --filter @jpcs/api test` and confirm the new DTO assertion fails.
- [x] Add failing ingestion coverage that creates a lobby player and moves the same UUID to Survival without incrementing `sessionCount`.
- [x] Add failing server-state coverage expecting `['lobby', 'survival', 'creative']`.
- [x] Add the shared lobby key and display-name behavior to DTO, ingestion, and server services.
- [x] Run `pnpm --filter @jpcs/api test` and confirm all API tests pass.

### Task 2: Track lobby in Velocity 1.0.5

**Files:**
- Modify: `plugins/velocity-bridge/build.gradle.kts`
- Modify: `plugins/velocity-bridge/src/main/java/org/jpcsapc/minecraft/BridgeConfig.java`
- Modify: `plugins/velocity-bridge/src/main/java/org/jpcsapc/minecraft/VelocityBridgePlugin.java`
- Create: `plugins/velocity-bridge/src/test/java/org/jpcsapc/minecraft/BridgeConfigTest.java`

**Interfaces:**
- Consumes: `lobby-server`, `survival-server`, and `creative-server` properties.
- Produces: lobby join, transfer, start, stop, and identified heartbeat payloads accepted by Task 1.

- [x] Add JUnit 5 and a failing config test expecting the generated and loaded backend map to contain `lobby` first.
- [x] Run the bridge test task and confirm it fails because lobby is absent.
- [x] Add `lobby-server=lobby`, include lobby in the backend map, and bump the bridge to `1.0.5`.
- [x] Run bridge tests and build the Java 25 JAR.
- [x] Inspect the JAR descriptor and class version to confirm `1.0.5` and Java class major version 69.

### Task 3: Refresh homepage and directory data

**Files:**
- Create: `apps/web/lib/live-data.ts`
- Create: `apps/web/lib/live-data.test.ts`
- Create: `apps/web/app/home-live.tsx`
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/app/players/player-directory.tsx`
- Modify: `apps/web/lib/api.ts`

**Interfaces:**
- Produces: `loadHomeData(fetcher, apiBase)` and `loadPlayers(fetcher, apiBase, search)` with stable fallback data.
- Consumes: initial server-rendered data and `/v1/servers`, `/v1/players`, `/v1/players/new`.

- [x] Add failing tests for the three homepage requests and preservation of previous data when a refresh request fails.
- [x] Run `pnpm --filter @jpcs/web test` and confirm the new tests fail because the helpers do not exist.
- [x] Implement the fetch helpers with explicit response checks.
- [x] Add a client homepage component that refreshes every 30 seconds and retains initial data until a successful response replaces it.
- [x] Reuse the player loader in the directory for search changes and 30-second refreshes.
- [x] Disable persistent caching for server-rendered API reads.
- [x] Run web tests and typecheck.

### Task 4: Guarded Cornbread cleanup

**Files:**
- Create: `apps/api/scripts/remove-false-cornbread.ts`
- Create: `apps/api/test/remove-false-cornbread.spec.ts`
- Modify: `apps/api/package.json`

**Interfaces:**
- Produces: `cleanup:false-cornbread`, which deletes UUID `0ed62306-1335-36f4-89a8-e289a75e6e54` only when the record still has the known false activity signature.

- [x] Add a failing test proving the cleanup deletes the unchanged false record and refuses a record with later activity.
- [x] Run the focused test and confirm it fails because the cleanup function does not exist.
- [x] Implement the guarded `deleteMany` query and CLI result reporting.
- [x] Run the focused test and all API tests.

### Task 5: Gemini operations handoff and final verification

**Files:**
- Create: `docs/operations/2026-09-04-gemini-lobby-discordsrv-handoff.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: bridge JAR 1.0.5 and API/web changes from Tasks 1 through 4.
- Produces: auditable server-administration instructions without embedding secrets or assuming Crafty paths.

- [x] Document the three-backend bridge contract and `lobby-server` property.
- [x] Write the Gemini prompt requiring topology audit, backups, mandatory-lobby proof, DiscordSRV move, permission testing, artifact deployment, cleanup execution, and live endpoint validation.
- [x] Run `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- [x] Review `git diff` and `git status` without staging or committing files.
