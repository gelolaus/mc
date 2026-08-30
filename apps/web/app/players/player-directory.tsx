'use client';

import { useEffect, useState } from 'react';
import { PlayerGrid, PlayerStrip } from '../../components';
import type { Player } from '../../lib/api';

export function PlayerDirectory({ initial }: { initial: Player[] }) {
  const [players, setPlayers] = useState(initial);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/v1/players?search=${encodeURIComponent(search)}`);
        if (response.ok) setPlayers(await response.json());
      } catch {}
    }, 180);
    return () => clearTimeout(timer);
  }, [search]);

  const online = players.filter((player) => player.online);

  return (
    <div className="player-directory">
      <div className="directory-toolbar">
        <label className="meta" htmlFor="player-search">Find a player</label>
        <input id="player-search" className="gui-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by username" />
      </div>
      <section className="directory-section">
        <div className="section-top">
          <h2 className="pixel">Online</h2>
          <span className="meta">{online.length} now</span>
        </div>
        {online.length > 0 ? <PlayerStrip players={online} /> : <div className="empty compact-empty">Nobody is online right now.</div>}
      </section>
      <section className="directory-section">
        <div className="section-top">
          <h2 className="pixel">Everyone</h2>
          <span className="meta">{players.length} players</span>
        </div>
        {players.length > 0 ? <PlayerGrid players={players} /> : <div className="empty compact-empty">No matching players found.</div>}
      </section>
    </div>
  );
}
