import { api, type Player } from '../../lib/api';
import { PlayerDirectory } from './player-directory';

export default async function PlayersPage() {
  const players = await api<Player[]>('/players');
  return (
    <section className="section">
      <h1 className="pixel" style={{ fontSize: 'clamp(42px, 6vw, 64px)' }}>Players</h1>
      <PlayerDirectory initial={players ?? []} />
    </section>
  );
}
