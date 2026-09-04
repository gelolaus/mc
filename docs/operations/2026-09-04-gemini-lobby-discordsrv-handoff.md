# Gemini handoff: lobby verification and presence rollout

Paste the prompt below into the Gemini conversation that has the Minecraft server-administration context.

## Prompt for Gemini

We are changing the JPCS-APC Minecraft network so a player becomes a website player only after successfully connecting to the lobby. DiscordSRV verification should be centralized in that lobby. Survival and Creative should stop duplicating verification only after you prove the lobby is mandatory and cannot be bypassed.

Codex has prepared these repository changes:

- Velocity bridge `1.0.5` tracks `lobby`, `survival`, and `creative`.
- The bridge property `lobby-server` defaults to `lobby`. Its value must exactly match the lobby backend name registered in Velocity.
- NestJS accepts lobby ingestion and exposes Lobby alongside Survival and Creative.
- The website refreshes server state, online players, newest players, and profiles every 30 seconds.
- `pnpm --filter @jpcs/api cleanup:false-cornbread` removes the old false `Cornbread2100_` record only if it still exactly matches the failed August 31 connection. It preserves the record if later genuine activity exists.

Please administer the server rollout. Do not edit repository source, commit, push, or expose secrets in chat. Show the evidence from each audit or command before moving to the next stage.

### 1. Audit before changing anything

1. Identify the Velocity service or Crafty instance, the lobby Paper server, Survival, and Creative.
2. Record the exact Velocity backend names and confirm whether the lobby backend is named `lobby`.
3. Prove every initial connection lands in the lobby.
4. Prove players cannot reach Survival or Creative through public backend ports, forced-host routing, proxy commands, fallback behavior, or permissions that bypass lobby verification.
5. Inspect the installed DiscordSRV version, its current verification/linking settings, the permission plugin, and where verification is currently enforced. Use the installed version's real config keys. Do not guess option names.
6. Identify the active JPCS bridge JAR and config, the API checkout and service, and how the service receives `DATABASE_URL` and `MINECRAFT_INGEST_SECRET`.
7. Back up every server configuration and plugin data directory that will change. Report the backup paths.

Stop and report if the lobby can be bypassed. Keep verification active on Survival and Creative until the bypass is closed and tested.

### 2. Prepare lobby verification

1. Install or enable the same compatible DiscordSRV build on the lobby.
2. Reuse the existing Discord server and account-linking configuration without printing its token or secrets.
3. Configure the lobby so unverified players can connect, receive verification instructions, and cannot transfer to Survival or Creative.
4. Configure verified players to transfer normally. Prefer the existing permission system and groups rather than adding another permission plugin.
5. Test with an unverified account and a verified account while the old Survival and Creative gates are still enabled.
6. Keep the duplicate verification gates active on Survival and Creative through the API and bridge deployment. Do not remove unrelated Discord chat or moderation features.

### 3. Deploy in compatibility order

1. After the user commits and pushes Codex's changes, update the API checkout using its existing owner. The previous deployment used `/opt/jpcs-minecraft`, owner `jpcsapi:jpcsapi`, and service `jpcs-minecraft-api.service`; verify all three before relying on them.
2. Install dependencies if the lockfile requires it, generate Prisma Client, build the API, and restart the actual API service as its existing service account.
3. Confirm the API is healthy before installing the bridge. The old bridge remains compatible during this stage.
4. Update the Velocity bridge config with `lobby-server=<exact Velocity lobby backend name>`.
5. Replace bridge `1.0.4` with `plugins/velocity-bridge/build/libs/jpcs-velocity-bridge-1.0.5.jar`. Ensure only one JPCS bridge JAR is active.
6. Restart Velocity and confirm its logs identify JPCS Velocity Bridge `1.0.5` without ingestion errors.
7. Query `https://api.mc.jpcs-apc.org/v1/servers` and confirm Lobby, Survival, and Creative have fresh heartbeats. Have a verified first-time test player enter the lobby and confirm one lobby player record appears while the old world gates remain active.
8. Only after lobby telemetry and both verified and unverified access tests pass, disable or remove the duplicate verification gate from Survival and Creative.
9. Run the guarded cleanup under the same environment and service account as the API:

   `pnpm --filter @jpcs/api cleanup:false-cornbread`

   Report whether it printed `Removed` or `Preserved`. Do not manually delete the record if the guard preserves it.

### 4. Validate behavior

1. Query `https://api.mc.jpcs-apc.org/v1/servers`. Confirm Lobby, Survival, and Creative each have a heartbeat newer than 60 seconds and accurate counts.
2. Query `https://api.mc.jpcs-apc.org/v1/players?online=true`. Compare UUIDs and usernames with Velocity's connected players and their actual current backends.
3. Recheck the first-time test player's record after the access-control cutover. Confirm it still has `currentServerKey: "lobby"` and appears in `/v1/players/new`.
4. Move that player to Survival, then Creative. Confirm the same UUID moves between server keys without creating another player or incrementing the session count for each transfer.
5. Disconnect the player. Confirm they become offline and playtime increases once.
6. Attempt a failed connection with an incompatible client. Confirm it does not create a player record.
7. Open `https://minecraft.jpcs-apc.org` for more than 30 seconds while a player joins and transfers. Confirm the server cards, Online section, New section, directory, and profile update without a manual page reload.
8. Confirm `Cornbread2100_` is absent from `/v1/players/new` and its profile returns not found if the guarded cleanup reported `Removed`.

If any validation fails before the cutover, keep the old verification gates active. If any validation fails after the cutover, restore the backed-up Survival and Creative verification configuration, retest access, and report the exact logs, HTTP status, payload, active plugin versions, and backend names.
