'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CopyIp, PlayerGrid, PlayerStrip, ServerList } from '../components';
import type { Player, Server } from '../lib/api';
import { refreshHomeData, type HomeData } from '../lib/live-data';

export function HomeLive({ initialServers, initialNewest, initialPlayers }: {
  initialServers: Server[] | null;
  initialNewest: Player[] | null;
  initialPlayers: Player[] | null;
}) {
  const initial = { servers: initialServers, newest: initialNewest, players: initialPlayers };
  const [data, setData] = useState<HomeData>(initial);
  const latest = useRef(data);

  useEffect(() => {
    let active = true;
    const update = async () => {
      const next = await refreshHomeData(latest.current);
      if (active) {
        latest.current = next;
        setData(next);
      }
    };
    void update();
    const timer = setInterval(update, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const host = data.servers?.[0]?.host ?? 'mc.jpcs-apc.org';
  const onlinePlayers = data.players?.filter((player) => player.online) ?? [];

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
          <ServerList servers={data.servers} />
        </div>
      </section>

      <section className="section world-layer cave-layer">
        <h2 className="pixel">Online</h2>
        {onlinePlayers.length > 0 ? <PlayerStrip players={onlinePlayers} /> : <p className="sub">No players online right now.</p>}
      </section>

      <section className="section world-layer deepslate-layer">
        <h2 className="pixel">New</h2>
        {data.newest?.length ? <PlayerGrid players={data.newest} /> : <p className="sub">No player records yet.</p>}
      </section>

      <section className="section world-layer bedrock-layer">
        <div className="section-top">
          <h2 className="pixel">All</h2>
          <Link href="/players">All players →</Link>
        </div>
        {data.players?.length ? <PlayerGrid players={data.players.slice(0, 12)} /> : <p className="sub">No player records yet.</p>}
      </section>
    </div>
  );
}
