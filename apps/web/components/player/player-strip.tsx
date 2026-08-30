import type { Player } from '../../lib/api';
import { GuiPanel } from '../gui/gui-panel';
import { PlayerSlot } from './player-slot';

export function PlayerStrip({ players }: { players: Player[] }) {
  return (
    <GuiPanel className="player-strip-panel">
      <div className="player-strip">
        {players.map((player) => <PlayerSlot key={player.minecraftUuid} player={player} size={72} />)}
      </div>
    </GuiPanel>
  );
}
