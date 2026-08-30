# Velocity network status

The Velocity proxy is the only Minecraft-side integration. It writes signed HTTPS events to NestJS and never accesses Postgres. Its `config.yml` maps Velocity backend names to the public keys `survival` and `creative`.

The API stores one `ServerState` per public key. Each heartbeat contains the key, the proxy boot timestamp, version, capacity, and connected player UUIDs. Player identities remain UUID-based; Java and Floodgate/Geyser players are both handled through Velocity's UUID values.

`GET /v1/servers` returns the two public states. The existing `GET /v1/server` returns an aggregate network state for backward compatibility. The homepage and world page show the two individual statuses.

The plugin targets Velocity 4 and Java 25. It creates a config file on first boot, uses `HttpClient` asynchronously, and sends an initial heartbeat after proxy initialization plus periodic heartbeats every 30 seconds.
