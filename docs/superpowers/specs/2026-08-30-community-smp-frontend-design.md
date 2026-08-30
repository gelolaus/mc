# Community SMP frontend redesign

## Summary

Redesign the JPCS-APC Minecraft website to feel like a warm community SMP hub with heavy Minecraft UI influence. The homepage serves both newcomers (join, server status) and current players (who is online, recent faces). The site works without world screenshots today and reserves space for a live map later.

## Goals

- Appeal to Minecraft players through recognizable in-game UI patterns.
- Stay professional and readable; avoid generic AI-generated landing page aesthetics.
- Use live API data (players, servers, world stats) as the primary visual content.
- Support future map integration without restructuring pages.

## Non-goals

- Live map setup or Dynmap/BlueMap configuration.
- New API endpoints or database changes for the redesign.
- Forums, voting, store, or account login.
- Heavy animation or scroll effects.

## Chosen direction

**Multiplayer Screen Home + Achievement/Book accents.**

The homepage follows the Java multiplayer server list: Survival and Creative as server rows with status, version, and player counts. Player heads are the main imagery. Profiles and world lore use book-page and achievement-badge styling. The player directory uses inventory-slot grids.

## Visual language

### Palette

| Token | Role |
| --- | --- |
| `--bg` | Deep stone/slate page background (~`#1e1e1e`) |
| `--panel` | Inventory panel fill (~`#2d2d2d`) |
| `--border` | GUI border gray (~`#c6c6c6`) |
| `--ink` | Primary text (~`#edf0e9`) |
| `--muted` | Secondary labels |
| `--grass` | Online / positive state |
| `--redstone` | Offline / warning state |
| `--gold` | Highlights (world age, milestones) |

### Typography

- **Headings and labels:** pixel/Minecraft-style display font for nav, section titles, stat labels, and online tags.
- **Body:** Plus Jakarta Sans (existing) for paragraphs and player names at small sizes.
- Pixel font is never used for long paragraphs.

### Texture and rendering

- Low-opacity dirt or stone tile on `body` (~8% opacity).
- `image-rendering: pixelated` on player heads and icons.
- GUI panels use sharp 2px borders; no glassmorphism, gradients, or glow effects.

## Page designs

### Homepage

**Join strip (new visitors)**

- Pixel-font site title: `JPCS-APC Minecraft`.
- Keep existing pitch: “Our forever world.”
- Hostname row with copy-IP GUI button.
- `LiveStatus` becomes two multiplayer-style server rows (Survival, Creative): online dot, player count, version, uptime.

**Who’s home (current players)**

- Horizontal strip of online player heads (64–80px), linking to profiles.
- Empty state: `No one’s online right now.`

**Community pulse**

- “New to the world”: newest 8 players in item-frame cards.
- “World stats”: four achievement-style badges (total players, world age, online now, servers online).

### Players

- Search input styled as GUI text field.
- “Online now”: tab-list inspired row layout (head, name, ONLINE tag).
- “Everyone”: inventory grid (6–8 columns desktop, 2 mobile).

### Player profile

- Large head inside item frame.
- Book-page fact layout: First joined, Last seen, Playtime, Sessions.
- Online state shown as grass-green indicator.

### World

- Expanded world stat badges (established, age, people, cumulative playtime, server status, version).
- Map section: empty map item frame with `Map coming soon` until `NEXT_PUBLIC_WORLD_MAP_URL` is set.

### Map (current)

- Same placeholder frame as World page map section.
- When URL is configured later, render iframe inside the frame without layout changes.

### Navigation

- Stone-button style links: Home, Players, World, Map.
- Grass-block dot beside brand when any server is online.

## Components

| Component | Purpose |
| --- | --- |
| `GuiPanel` | Shared inventory-style container |
| `GuiButton` | Beveled copy-IP and action buttons |
| `ServerRow` | Multiplayer list entry for one backend |
| `PlayerSlot` | Head + name card for grids and strips |
| `StatBadge` | Achievement-style stat display |
| `ItemFrame` | Border wrapper for heads and map placeholder |

Existing `LiveStatus`, `PlayerCard`, and `CopyIp` are refactored into or replaced by these primitives.

## Data and API

No backend changes. Continue using:

- `GET /v1/servers` for Survival/Creative status
- `GET /v1/players`, `/players/new`, `/players/:id`
- `GET /v1/world` for world page stats
- Player avatars via `skinTextureHash` with username fallback

## Anti-slop rules

- No stock hero images or AI-generated landscapes.
- No vague community marketing copy; keep JPCS-specific language.
- Empty states describe the real condition (bridge disconnected, no players online).
- At most one subtle motion: online dot pulse. No scroll animations.

## Technical approach

- Extend `globals.css` with GUI design tokens.
- Add focused components under `apps/web/components/`.
- Refactor `app/page.tsx`, `players/`, `world/`, `map/`, and `layout.tsx` to use new primitives.
- Add or update Vitest tests for component contracts and layout expectations.
- Keep Next.js App Router and existing `api()` client.

## Future: live map

When a map URL is available, set `NEXT_PUBLIC_WORLD_MAP_URL`. The Map page and World page map section render an iframe inside the existing `ItemFrame` without structural changes.

## Success criteria

- A Minecraft player recognizes the UI within five seconds.
- Homepage works for both first-time visitors and returning players without separate routes.
- Site looks complete with zero screenshots and an empty map slot.
- Player heads render correctly for SkinRestorer and premium accounts.
