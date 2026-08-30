import Link from 'next/link';
import { CopyIp, PlayerGrid, PlayerStrip, ServerList } from '../components';
import { api, type Player, type Server } from '../lib/api';

export default async function Home() {
  const [servers, newest, players] = await Promise.all([
    api<Server[]>('/servers'),
    api<Player[]>('/players/new'),
    api<Player[]>('/players'),
  ]);
  const first = servers?.[0];
  const host = first?.host ?? 'mc.jpcs-apc.org';
  const onlinePlayers = players?.filter((player) => player.online) ?? [];

  return (
    <div className="world-cutaway">
      <section className="hero hero-world surface-layer">
        <div className="hero-scene" aria-hidden="true" />
        <div className="hero-copy">
          <h1 className="pixel hero-title"><span>JPCS-APC</span><span>Minecraft</span></h1>
          <div className="gui-panel ip-row">
            <span className="meta pixel">{host}</span>
            <CopyIp host={host} />
          </div>
        </div>
        <div className="hero-network">
          <ServerList initial={servers} />
        </div>
      </section>

      <section className="section world-layer cave-layer">
        <h2 className="pixel">Online</h2>
        {onlinePlayers.length > 0 ? <PlayerStrip players={onlinePlayers} /> : <p className="sub">No players online right now.</p>}
      </section>

      <section className="section world-layer deepslate-layer">
        <h2 className="pixel">New</h2>
        {newest?.length ? <PlayerGrid players={newest} /> : <p className="sub">No player records yet.</p>}
      </section>

      <section className="section world-layer bedrock-layer">
        <div className="section-top">
          <h2 className="pixel">All</h2>
          <Link href="/players">All players →</Link>
        </div>
        {players?.length ? <PlayerGrid players={players.slice(0, 12)} /> : <p className="sub">No player records yet.</p>}
      </section>
    </div>
  );
}
