import Link from 'next/link';
import { CopyIp, PlayerGrid, PlayerStrip, ServerList, StatBadge } from '../components';
import { api, type Player, type Server } from '../lib/api';
import { date, duration } from '../lib/format';

export default async function Home() {
  const [servers, newest, players] = await Promise.all([
    api<Server[]>('/servers'),
    api<Player[]>('/players/new'),
    api<Player[]>('/players'),
  ]);
  const first = servers?.[0];
  const host = first?.host ?? 'mc.jpcs-apc.org';
  const onlineServers = servers?.filter((server) => server.online) ?? [];
  const onlinePlayers = players?.filter((player) => player.online) ?? [];

  return (
    <>
      <section className="hero">
        <div className="eyebrow pixel">JPCS-APC MINECRAFT</div>
        <h1 className="pixel">Our forever world.</h1>
        <p className="lede">A Minecraft world for the JPCS-APC community, built together and kept for the long run.</p>
        <div className="gui-panel ip-row">
          <span className="meta pixel">{host}</span>
          <CopyIp host={host} />
        </div>
        <ServerList initial={servers} />
        <p className="meta">WORLD CREATED {first ? date(first.worldCreatedAt) : 'Status unavailable'} · WORLD AGE {first ? duration(first.worldAgeSeconds, true) : '—'}</p>
      </section>

      <section className="section">
        <h2 className="pixel">Who&apos;s home</h2>
        <p className="sub">Players online right now.</p>
        {onlinePlayers.length ? <PlayerStrip players={onlinePlayers} /> : <div className="empty">No one&apos;s online right now.</div>}
      </section>

      <section className="section">
        <div className="section-top">
          <div>
            <h2 className="pixel">New to the world</h2>
            <p className="sub">The newest people to join our world.</p>
          </div>
        </div>
        {newest?.length ? <PlayerGrid players={newest} /> : <div className="empty">Player records will appear here once the bridge is connected.</div>}
      </section>

      <section className="section">
        <div className="section-top">
          <div>
            <h2 className="pixel">The players</h2>
            <p className="sub">{players?.length ?? 0} people have called this world home.</p>
          </div>
          <Link href="/players">Explore everyone →</Link>
        </div>
        {players?.length ? <PlayerGrid players={players.slice(0, 12)} /> : <p className="sub">The player directory will grow with the world.</p>}
      </section>

      <section className="section">
        <h2 className="pixel">World stats</h2>
        <div className="stats-row">
          <StatBadge label="PLAYERS" value={players?.length ?? '—'} />
          <StatBadge label="WORLD AGE" value={first ? duration(first.worldAgeSeconds) : '—'} />
          <StatBadge label="ONLINE" value={onlineServers.reduce((total, server) => total + (server.playersOnline ?? 0), 0)} />
          <StatBadge label="SERVERS ONLINE" value={onlineServers.length} />
        </div>
      </section>
    </>
  );
}
