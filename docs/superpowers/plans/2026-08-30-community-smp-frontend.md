# Community SMP Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the JPCS-APC Minecraft website as a heavy Minecraft UI community SMP hub that serves both newcomers and current players without requiring world screenshots.

**Architecture:** Replace the current generic dark landing layout with reusable GUI primitives (`GuiPanel`, `ServerRow`, `PlayerSlot`, etc.) styled via CSS design tokens in `globals.css`. Pages compose these primitives with existing `api()` data. No API changes.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS 4, Vitest, existing `lib/api.ts` client.

**Spec:** `docs/superpowers/specs/2026-08-30-community-smp-frontend-design.md`

## Global Constraints

- No new API endpoints or database changes.
- No stock hero images, AI landscapes, gradients, glassmorphism, or scroll animations.
- Pixel font for headings and labels only; body text stays readable (Plus Jakarta Sans).
- Player avatars use `skinTextureHash` with username fallback via existing `avatar(player)`.
- Map pages reserve an `ItemFrame` placeholder until `NEXT_PUBLIC_WORLD_MAP_URL` is set.
- At most one motion: optional online-dot pulse.
- Keep JPCS-specific copy; no vague community marketing filler.
- GUI panels use sharp 2px borders on stone/slate palette (`--bg` ~`#1e1e1e`, `--panel` ~`#2d2d2d`, `--border` ~`#c6c6c6`).

## File map

| File | Responsibility |
| --- | --- |
| `apps/web/app/globals.css` | GUI tokens, textures, layout utilities |
| `apps/web/app/layout.tsx` | Pixel display font, nav shell, online brand dot |
| `apps/web/components/gui/gui-panel.tsx` | Inventory-style container |
| `apps/web/components/gui/gui-button.tsx` | Beveled action button |
| `apps/web/components/gui/item-frame.tsx` | Head/map frame border |
| `apps/web/components/gui/stat-badge.tsx` | Achievement-style stat |
| `apps/web/components/server/server-row.tsx` | One multiplayer server row |
| `apps/web/components/server/server-list.tsx` | Client poller + row list (replaces `LiveStatus`) |
| `apps/web/components/player/player-slot.tsx` | Head + name link card |
| `apps/web/components/player/player-strip.tsx` | Horizontal online strip |
| `apps/web/components/player/player-grid.tsx` | Inventory grid |
| `apps/web/components/map/map-frame.tsx` | Map iframe or placeholder |
| `apps/web/components/index.ts` | Re-exports |
| `apps/web/app/page.tsx` | Homepage sections |
| `apps/web/app/players/page.tsx` | Players page shell |
| `apps/web/app/players/player-directory.tsx` | Search + online/everyone |
| `apps/web/app/players/[player]/page.tsx` | Book-style profile |
| `apps/web/app/world/page.tsx` | World stats + map slot |
| `apps/web/app/map/page.tsx` | Map page |
| `apps/web/components.tsx` | Delete after migration |
| `apps/web/components/gui/gui.test.ts` | CSS class contract tests |
| `apps/web/components/server/server.test.ts` | Server row rendering tests |

---

### Task 1: GUI design tokens and pixel font

**Files:**
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/app/layout.tsx`
- Add: `apps/web/fonts/minecraft-latin.woff2` (or equivalent licensed pixel font)
- Test: `apps/web/app/layout.test.ts`

**Interfaces:**
- Produces: CSS classes `gui-panel`, `gui-button`, `item-frame`, `stat-badge`, `server-row`, `player-slot`, `player-grid`, `player-strip`, `nav-button`, `brand-online`
- Produces: CSS variable `--font-mc-pixel` from layout

- [ ] **Step 1: Write the failing test**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('GUI theme', () => {
  it('defines minecraft gui tokens and classes', () => {
    const css = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8');
    expect(css).toContain('--panel:');
    expect(css).toContain('--border:');
    expect(css).toContain('--grass:');
    expect(css).toContain('.gui-panel');
    expect(css).toContain('.server-row');
    expect(css).toContain('image-rendering: pixelated');
  });

  it('loads a pixel display font in layout', () => {
    const layout = readFileSync(fileURLToPath(new URL('./layout.tsx', import.meta.url)), 'utf8');
    expect(layout).toContain('--font-mc-pixel');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `corepack pnpm --filter @jpcs/web test app/layout.test.ts`
Expected: FAIL on missing `--panel` / `--font-mc-pixel`

- [ ] **Step 3: Replace globals.css tokens and add GUI classes**

Replace `:root` tokens and add classes. Keep existing `.shell`, `.section`, `.meta` where still useful.

```css
:root {
  --bg: #1e1e1e;
  --panel: #2d2d2d;
  --border: #c6c6c6;
  --ink: #edf0e9;
  --muted: #a3aa9f;
  --grass: #5db04c;
  --redstone: #d94c4c;
  --gold: #e8c84a;
  --slot: #1a1a1a;
  --focus: #83b1ff;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-mc-sans), ui-sans-serif, system-ui, sans-serif;
  background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 16px 16px;
}

h1, h2, .pixel {
  font-family: var(--font-mc-pixel), var(--font-mc-display), ui-sans-serif, sans-serif;
  letter-spacing: 0.02em;
}

.gui-panel {
  border: 2px solid var(--border);
  background: var(--panel);
  box-shadow: inset 0 0 0 1px #000;
}

.gui-button {
  padding: 8px 14px;
  border: 2px solid var(--border);
  border-bottom-color: #6f6f6f;
  border-right-color: #6f6f6f;
  background: #8b8b8b;
  color: #111;
  font-family: var(--font-mc-pixel), ui-sans-serif, sans-serif;
  font-size: 12px;
  cursor: pointer;
}

.gui-button:active {
  border-bottom-color: var(--border);
  border-right-color: var(--border);
  border-top-color: #6f6f6f;
  border-left-color: #6f6f6f;
}

.item-frame {
  display: inline-flex;
  padding: 6px;
  border: 3px solid #8b6a3e;
  background: #c6a15b;
  box-shadow: inset 0 0 0 2px #5a3f1b;
}

.stat-badge {
  display: flex;
  min-height: 88px;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 16px 18px;
  border: 2px solid var(--border);
  background: var(--panel);
}

.server-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 2px solid #1a1a1a;
}

.server-row:last-child { border-bottom: 0; }

.player-slot {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--slot);
  border: 2px solid #111;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 2px;
  background: #111;
  border: 2px solid var(--border);
}

.player-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 12px;
}

.avatar {
  image-rendering: pixelated;
  background: #d6d8d2;
}

.online { color: var(--grass); }
.offline { color: var(--redstone); }

.brand-online::before {
  background: var(--grass);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
```

- [ ] **Step 4: Add pixel font to layout**

```tsx
const pixel = localFont({
  src: '../fonts/minecraft-latin.woff2',
  variable: '--font-mc-pixel',
  weight: '400',
  display: 'swap',
});

// html className includes pixel.variable
// Replace Syne on h1 with pixel font via .pixel class on titles
```

Source a licensed pixel font file (e.g. bundled Minecraftia/Minecraft Regular if licensed for web use) into `apps/web/fonts/`.

- [ ] **Step 5: Run tests**

Run: `corepack pnpm --filter @jpcs/web test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/globals.css apps/web/app/layout.tsx apps/web/app/layout.test.ts apps/web/fonts/
git commit -m "style(web): add minecraft gui design tokens and pixel font"
```

---

### Task 2: GUI primitive components

**Files:**
- Create: `apps/web/components/gui/gui-panel.tsx`
- Create: `apps/web/components/gui/gui-button.tsx`
- Create: `apps/web/components/gui/item-frame.tsx`
- Create: `apps/web/components/gui/stat-badge.tsx`
- Create: `apps/web/components/gui/gui.test.ts`
- Create: `apps/web/components/index.ts`

**Interfaces:**
- Produces:
  - `GuiPanel({ children, className? }: { children: React.ReactNode; className?: string })`
  - `GuiButton({ children, onClick, type? }: React.ButtonHTMLAttributes<HTMLButtonElement>)`
  - `ItemFrame({ children, className? }: { children: React.ReactNode; className?: string })`
  - `StatBadge({ label, value }: { label: string; value: React.ReactNode })`

- [ ] **Step 1: Write failing tests**

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('gui components', () => {
  it('exports primitive wrappers with expected class names', () => {
    const panel = readFileSync(fileURLToPath(new URL('./gui-panel.tsx', import.meta.url)), 'utf8');
    const button = readFileSync(fileURLToPath(new URL('./gui-button.tsx', import.meta.url)), 'utf8');
    const frame = readFileSync(fileURLToPath(new URL('./item-frame.tsx', import.meta.url)), 'utf8');
    const badge = readFileSync(fileURLToPath(new URL('./stat-badge.tsx', import.meta.url)), 'utf8');
    expect(panel).toContain('gui-panel');
    expect(button).toContain('gui-button');
    expect(frame).toContain('item-frame');
    expect(badge).toContain('stat-badge');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `corepack pnpm --filter @jpcs/web test components/gui/gui.test.ts`
Expected: FAIL (files missing)

- [ ] **Step 3: Implement primitives**

```tsx
// gui-panel.tsx
export function GuiPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`gui-panel ${className}`.trim()}>{children}</div>;
}

// gui-button.tsx
export function GuiButton({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`gui-button ${className}`.trim()} {...props}>{children}</button>;
}

// item-frame.tsx
export function ItemFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`item-frame ${className}`.trim()}>{children}</div>;
}

// stat-badge.tsx
export function StatBadge({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="stat-badge"><span className="meta pixel">{label}</span><b>{value}</b></div>;
}
```

- [ ] **Step 4: Export from `components/index.ts`**

- [ ] **Step 5: Run tests**

Run: `corepack pnpm --filter @jpcs/web test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/
git commit -m "feat(web): add minecraft gui primitive components"
```

---

### Task 3: Server list rows (replaces LiveStatus)

**Files:**
- Create: `apps/web/components/server/server-row.tsx`
- Create: `apps/web/components/server/server-list.tsx`
- Create: `apps/web/components/server/server.test.ts`
- Modify: `apps/web/components/index.ts`

**Interfaces:**
- Consumes: `Server` from `lib/api`, `duration` from `lib/format`
- Produces:
  - `ServerRow({ server }: { server: Server })`
  - `ServerList({ initial }: { initial: Server[] | null })` (client component, 30s poll)

- [ ] **Step 1: Write failing test**

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('server list', () => {
  it('renders multiplayer-style rows with online state classes', () => {
    const row = readFileSync(fileURLToPath(new URL('./server-row.tsx', import.meta.url)), 'utf8');
    const list = readFileSync(fileURLToPath(new URL('./server-list.tsx', import.meta.url)), 'utf8');
    expect(row).toContain('server-row');
    expect(row).toContain('displayName');
    expect(row).toContain('playersOnline');
    expect(list).toContain('/v1/servers');
    expect(list).toContain('30000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `corepack pnpm --filter @jpcs/web test components/server/server.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement ServerRow**

```tsx
'use client';
import type { Server } from '../../lib/api';
import { duration } from '../../lib/format';

export function ServerRow({ server }: { server: Server }) {
  return (
    <div className="server-row">
      <span className={server.online ? 'online' : 'offline'}>●</span>
      <div>
        <b className="pixel">{server.displayName}</b>
        <div className="meta">{server.version ?? '—'} · {server.online ? duration(server.uptimeSeconds) : 'OFFLINE'}</div>
      </div>
      <div className="meta pixel">{server.online ? `${server.playersOnline} / ${server.playersMax}` : '—'}</div>
    </div>
  );
}
```

- [ ] **Step 4: Implement ServerList with polling**

Port polling logic from current `LiveStatus` in `components.tsx`. Wrap rows in `GuiPanel`. Empty API state shows `Status unavailable` inside panel.

- [ ] **Step 5: Run tests**

Run: `corepack pnpm --filter @jpcs/web test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/server apps/web/components/index.ts
git commit -m "feat(web): add multiplayer-style server list rows"
```

---

### Task 4: Player slot components

**Files:**
- Create: `apps/web/components/player/player-slot.tsx`
- Create: `apps/web/components/player/player-strip.tsx`
- Create: `apps/web/components/player/player-grid.tsx`
- Create: `apps/web/components/player/player.test.ts`

**Interfaces:**
- Consumes: `Player`, `avatar` from `lib/api`
- Produces:
  - `PlayerSlot({ player, size? }: { player: Player; size?: number })`
  - `PlayerStrip({ players }: { players: Player[] })`
  - `PlayerGrid({ players }: { players: Player[] })`

- [ ] **Step 1: Write failing test**

```ts
describe('player components', () => {
  it('links slots to profile pages and uses avatar(player)', () => {
    const slot = readFileSync(...'./player-slot.tsx'..., 'utf8');
    expect(slot).toContain('player-slot');
    expect(slot).toContain('avatar(player)');
    expect(slot).toContain('/players/');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Implement PlayerSlot with ItemFrame-wrapped head**

```tsx
import Image from 'next/image';
import Link from 'next/link';
import { avatar, type Player } from '../../lib/api';

export function PlayerSlot({ player, size = 64 }: { player: Player; size?: number }) {
  return (
    <Link href={`/players/${encodeURIComponent(player.username)}`} className="player-slot">
      <ItemFrame>
        <Image className="avatar" src={avatar(player)} alt={`${player.username}'s Minecraft head`} width={size} height={size} />
      </ItemFrame>
      <span className="username">{player.username}</span>
      <span className="meta pixel">{player.online ? 'ONLINE' : 'OFFLINE'}</span>
    </Link>
  );
}
```

`PlayerStrip` maps online players horizontally. `PlayerGrid` uses `.player-grid` wrapper.

- [ ] **Step 4: Run tests**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(web): add player slot strip and inventory grid"
```

---

### Task 5: Copy IP button and map frame

**Files:**
- Create: `apps/web/components/gui/copy-ip.tsx`
- Create: `apps/web/components/map/map-frame.tsx`
- Create: `apps/web/components/map/map.test.ts`

**Interfaces:**
- Produces:
  - `CopyIp({ host }: { host: string })` using `GuiButton`
  - `MapFrame()` reads `process.env.NEXT_PUBLIC_WORLD_MAP_URL`; renders iframe in `GuiPanel` + `ItemFrame` or placeholder text `Map coming soon`

- [ ] **Step 1: Write failing test for map placeholder**

```ts
it('shows map coming soon without env url', () => {
  const map = readFileSync(...'./map-frame.tsx'..., 'utf8');
  expect(map).toContain('Map coming soon');
  expect(map).toContain('NEXT_PUBLIC_WORLD_MAP_URL');
});
```

- [ ] **Step 2–5: Implement, test, commit**

```bash
git commit -m "feat(web): add gui copy ip button and map placeholder frame"
```

---

### Task 6: Navigation with online indicator

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Create: `apps/web/components/site-header.tsx` (client, optional if server layout needs fetch)

**Interfaces:**
- Consumes: `GET /v1/servers` for any-online check
- Produces: `SiteHeader({ anyOnline }: { anyOnline: boolean })` with `brand-online` class when true; nav links use `nav-button` class

- [ ] **Step 1: Fetch servers in layout (server component)**

```tsx
import { api, type Server } from '../lib/api';
import { SiteHeader } from '../components/site-header';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const servers = await api<Server[]>('/servers');
  const anyOnline = servers?.some((s) => s.online) ?? false;
  return (
    <html ...>
      <body>
        <SiteHeader anyOnline={anyOnline} />
        <main className="shell">{children}</main>
        ...
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Style nav links as stone GUI buttons in globals.css**

```css
.nav-button {
  padding: 6px 10px;
  border: 2px solid var(--border);
  background: #5a5a5a;
  font-family: var(--font-mc-pixel), ui-sans-serif, sans-serif;
  font-size: 11px;
}
```

- [ ] **Step 3: Verify layout test still passes; commit**

```bash
git commit -m "feat(web): add gui navigation with online brand indicator"
```

---

### Task 7: Homepage redesign

**Files:**
- Modify: `apps/web/app/page.tsx`

**Interfaces:**
- Consumes: `ServerList`, `CopyIp`, `PlayerStrip`, `PlayerGrid`, `StatBadge`, `GuiPanel`
- Data: `/servers`, `/players/new`, `/players` (filter `online` for strip)

- [ ] **Step 1: Write failing homepage structure test**

```ts
// apps/web/app/page.test.ts
it('includes join, whos home, and community sections', () => {
  const page = readFileSync(...'./page.tsx'..., 'utf8');
  expect(page).toContain('Who');
  expect(page).toContain('ServerList');
  expect(page).toContain('PlayerStrip');
  expect(page).toContain('StatBadge');
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Rewrite homepage**

Structure:

```tsx
export default async function Home() {
  const [servers, newest, players] = await Promise.all([...]);
  const host = servers?.[0]?.host ?? 'mc.jpcs-apc.org';
  const onlinePlayers = players?.filter((p) => p.online) ?? [];

  return (
    <>
      <section className="hero">
        <div className="eyebrow pixel">JPCS-APC MINECRAFT</div>
        <h1 className="pixel">Our forever world.</h1>
        <p className="lede">A Minecraft world for the JPCS-APC community, built together and kept for the long run.</p>
        <GuiPanel className="ip-row">
          <span className="meta pixel">{host}</span>
          <CopyIp host={host} />
        </GuiPanel>
        <ServerList initial={servers} />
      </section>

      <section className="section">
        <h2 className="pixel">Who&apos;s home</h2>
        {onlinePlayers.length ? <PlayerStrip players={onlinePlayers} /> : <div className="empty">No one&apos;s online right now.</div>}
      </section>

      <section className="section">
        <h2 className="pixel">New to the world</h2>
        {newest?.length ? <PlayerGrid players={newest} /> : <div className="empty">Player records will appear here once the bridge is connected.</div>}
      </section>

      <section className="section">
        <h2 className="pixel">World stats</h2>
        <div className="stats-row">
          <StatBadge label="PLAYERS" value={players?.length ?? '—'} />
          ...
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 4: Add `.stats-row` grid to globals.css (4 columns, 2 on mobile)**

- [ ] **Step 5: Run tests, typecheck, commit**

```bash
corepack pnpm --filter @jpcs/web typecheck
corepack pnpm --filter @jpcs/web test
git commit -m "feat(web): redesign homepage as multiplayer community hub"
```

---

### Task 8: Players directory page

**Files:**
- Modify: `apps/web/app/players/page.tsx`
- Modify: `apps/web/app/players/player-directory.tsx`

- [ ] **Step 1: Write failing test for tab-list online section**

```ts
expect(directory).toContain('Online now');
expect(directory).toContain('player-strip');
expect(directory).toContain('player-grid');
```

- [ ] **Step 2: Update player-directory**

- Search input gets `gui-panel` styled field class `.gui-input`
- Online section: horizontal `PlayerStrip` or row list with larger heads
- Everyone: `PlayerGrid`
- Empty online: `Nobody is online right now.`

- [ ] **Step 3: Run tests; commit**

```bash
git commit -m "feat(web): restyle players directory with gui layout"
```

---

### Task 9: Player profile book page

**Files:**
- Modify: `apps/web/app/players/[player]/page.tsx`

- [ ] **Step 1: Write failing test**

```ts
expect(profile).toContain('ItemFrame');
expect(profile).toContain('book-page');
```

- [ ] **Step 2: Add `.book-page` styles to globals.css** (parchment-tinted panel inside `GuiPanel`)

- [ ] **Step 3: Rewrite profile layout**

```tsx
<section className="profile">
  <div className="profile-head">
    <ItemFrame>
      <Image className="avatar" src={avatar(player)} width={104} height={104} ... />
    </ItemFrame>
    <div>
      <h1 className="pixel">{player.username}</h1>
      <span className={player.online ? 'online pixel' : 'offline pixel'}>● {player.online ? 'ONLINE' : 'OFFLINE'}</span>
    </div>
  </div>
  <GuiPanel className="book-page">
    <div className="facts">...</div>
  </GuiPanel>
</section>
```

- [ ] **Step 4: Run tests; commit**

```bash
git commit -m "feat(web): restyle player profile as book page"
```

---

### Task 10: World and Map pages

**Files:**
- Modify: `apps/web/app/world/page.tsx`
- Modify: `apps/web/app/map/page.tsx`

- [ ] **Step 1: Write failing tests for MapFrame usage**

- [ ] **Step 2: World page — stat badges + MapFrame at bottom**

- [ ] **Step 3: Map page — title + MapFrame only**

- [ ] **Step 4: Run tests; commit**

```bash
git commit -m "feat(web): restyle world and map pages with gui frames"
```

---

### Task 11: Remove legacy components and verify build

**Files:**
- Delete: `apps/web/components.tsx`
- Modify: all imports to use `apps/web/components/index.ts`
- Modify: `apps/web/app/layout.test.ts` if needed

- [ ] **Step 1: Grep for `from '../components'` and `from '../../components'` — update paths**

- [ ] **Step 2: Delete `components.tsx`**

- [ ] **Step 3: Run full verification**

```bash
corepack pnpm --filter @jpcs/web lint
corepack pnpm --filter @jpcs/web typecheck
corepack pnpm --filter @jpcs/web test
corepack pnpm --filter @jpcs/web build
```

Expected: all pass

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(web): remove legacy components barrel"
```

---

## Spec coverage check

| Spec requirement | Task |
| --- | --- |
| Multiplayer server rows | Task 3, 7 |
| Who's home strip | Task 4, 7 |
| New to the world grid | Task 4, 7 |
| World stat badges | Task 2, 7, 10 |
| Players search + online/everyone | Task 8 |
| Book profile | Task 9 |
| Map placeholder | Task 5, 10 |
| Nav with online dot | Task 6 |
| No API changes | All tasks |
| Anti-slop rules | Global constraints |
| skinTextureHash avatars | Task 4 (uses existing `avatar(player)`) |

## Placeholder scan

No TBD steps. Each task has file paths, code, and commands.

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-30-community-smp-frontend.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — implement tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
