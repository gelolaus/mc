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
    <>
      <input className="gui-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search players…" aria-label="Search players" />
      <div className="section">
        <h2 className="pixel">Online</h2>
        {online.length > 0 && <PlayerStrip players={online} />}
      </div>
      <div className="section">
        <h2 className="pixel">All</h2>
        <PlayerGrid players={players} />
      </div>
    </>
  );
}
