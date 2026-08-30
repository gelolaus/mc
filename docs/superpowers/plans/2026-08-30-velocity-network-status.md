# Velocity Network Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Report Survival and Creative state from one drop-in Velocity plugin.

**Architecture:** NestJS persists a state per public server key. A Java 25 Velocity 4 plugin posts authenticated events. Next.js renders the two states without directly accessing Postgres.

**Tech Stack:** Prisma, NestJS, Next.js, Gradle, Velocity API 4, Java 25.

**Spec:** `docs/superpowers/specs/2026-08-30-velocity-network-status-design.md`

## Global Constraints

- Use Velocity 4 and Java 25.
- Keep `MINECRAFT_INGEST_SECRET` only in the API and Velocity plugin config.
- Keep player `firstJoinedAt` immutable.
- Report the configured `survival` and `creative` server keys separately.

---

### Task 1: Per-server API state

**Files:** Prisma schema and migration, API DTOs, ingestion and server services, API tests.

- [ ] Write failing tests for keyed heartbeat state and aggregate output.
- [ ] Update `ServerState` to use `serverKey` as its unique public identifier.
- [ ] Accept `serverKey` in heartbeat and start/stop events.
- [ ] Return `/v1/servers` and preserve aggregate `/v1/server`.
- [ ] Run API tests and typecheck.

### Task 2: Velocity plugin

**Files:** `plugins/velocity-bridge/` Gradle project, source, plugin descriptor, config template, tests.

- [ ] Write failing tests for configured backend classification and JSON event construction.
- [ ] Implement a Java 25 Velocity 4 plugin with asynchronous HTTP delivery.
- [ ] Send join, quit, start, stop, and 30-second keyed heartbeats.
- [ ] Build the JAR and verify its descriptor and generated config.

### Task 3: Website and documentation

**Files:** API client, status component, home/world pages, README, environment example, UI tests.

- [ ] Write failing UI data-shape tests for two server states.
- [ ] Render simple Survival and Creative cards.
- [ ] Document installation and Oracle outbound HTTPS requirements.
- [ ] Run workspace tests, typecheck, and production build after stopping dev.
