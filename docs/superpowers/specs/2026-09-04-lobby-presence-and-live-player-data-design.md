# Lobby presence and live player data

## Goal

Count a person as a JPCS Minecraft player after Velocity confirms that they successfully connected to the lobby. Keep lobby, Survival, and Creative presence current on the public website, and remove the known false `Cornbread2100_` record without deleting legitimate activity.

## Architecture

Velocity remains the source of network presence. The bridge tracks three backend keys: `lobby`, `survival`, and `creative`. `PostLoginEvent` records only the proxy connection time. The first successful `ServerConnectedEvent` sends the player join event, including the backend key. Thirty-second heartbeats for all three backends send the current identified player list and make each backend authoritative for its own membership.

DiscordSRV controls account verification and access. It does not publish website statistics. Server administration moves the verification gate to the unavoidable lobby and removes duplicate gates from Survival and Creative only after proving that direct backend access and proxy transfer bypasses are blocked.

The NestJS API accepts `lobby` anywhere it accepts a server key. Public server state returns Lobby, Survival, and Creative. Existing player records remain UUID-based. A guarded maintenance command removes `Cornbread2100_` only when its UUID and false-record activity fields still match the known failed connection.

The Next.js homepage owns a client-side live-data component. It refreshes server state, all players, and newest players every 30 seconds. The player directory refreshes on the same interval while retaining search. Server-rendered fetches use no persistent cache so navigation does not revive stale player state.

## Data flow

1. A connection to Velocity alone creates no player record.
2. A successful connection to Lobby, Survival, or Creative creates or updates the UUID-based player record.
3. Heartbeats reconcile online membership independently for each backend.
4. Moving between backends changes `currentServerKey` without incrementing the session count.
5. Disconnecting marks the player offline and records playtime.
6. Browsers refresh public player and server endpoints every 30 seconds.

## Failure handling

- A failed lobby connection never emits `ServerConnectedEvent`, so it never becomes a player.
- Heartbeats repair missed join, transfer, or quit events.
- Failed browser refreshes retain the most recent successful data.
- The Cornbread cleanup refuses to delete a record if subsequent genuine activity changed the known false-record signature.
- Survival and Creative verification must remain enabled until Gemini confirms the lobby is mandatory and the backend ports cannot be reached directly.

## Verification

- API tests cover `lobby` DTO acceptance, lobby heartbeat creation, backend transfer, and public three-server output.
- Web tests cover live-data endpoint requests and retention of prior data on refresh failure.
- Bridge tests cover the generated lobby configuration and backend name mapping.
- Build the bridge with Java 25 and verify the JAR descriptor reports the new version.
- Run the repository tests, typecheck, and production build.
- Gemini validates the deployment with one unverified account, one verified first-time player, one returning player, and a failed outdated-client connection.

## Ownership

Codex changes and verifies repository source and produces the bridge JAR. Gemini performs Minecraft host administration, DiscordSRV relocation, permissions changes, deployment, production database cleanup, and live log checks. The user stages, commits, and pushes repository changes manually.
