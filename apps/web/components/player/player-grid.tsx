import type { Player } from '../../lib/api';
import { PlayerSlot } from './player-slot';

export function PlayerGrid({ players }: { players: Player[] }) {
  return (
    <div className="player-grid">
      {players.map((player) => <PlayerSlot key={player.minecraftUuid} player={player} />)}
    </div>
  );
}
