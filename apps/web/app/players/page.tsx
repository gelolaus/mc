import { api, type Player } from '../../lib/api';
import { PlayerDirectory } from './player-directory';

export default async function PlayersPage() {
  const players = await api<Player[]>('/players');
  return (
    <section className="section interior-page directory-page">
      <header className="page-heading">
        <span className="eyebrow">Community roster</span>
        <h1 className="pixel">Players</h1>
        <p className="sub">Everyone who has joined the world.</p>
      </header>
      <PlayerDirectory initial={players ?? []} />
    </section>
  );
}
