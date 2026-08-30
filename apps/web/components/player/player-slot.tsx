import Image from 'next/image';
import Link from 'next/link';
import { avatar, type Player } from '../../lib/api';
import { ItemFrame } from '../gui/item-frame';

export function PlayerSlot({ player, size = 64 }: { player: Player; size?: number }) {
  return (
    <Link
      href={`/players/${encodeURIComponent(player.username)}`}
      className="player-slot"
      aria-label={`${player.username} is currently ${player.online ? 'online' : 'offline'}`}
    >
      <ItemFrame>
        <Image className="avatar" src={avatar(player)} alt={`${player.username}'s Minecraft head`} width={size} height={size} />
      </ItemFrame>
      <span className="player-card-copy">
        <span className="username" title={player.username}>{player.username}</span>
        <span className={`player-presence ${player.online ? 'online' : 'offline'}`}>
          {player.online ? 'Online' : 'Offline'}
        </span>
      </span>
    </Link>
  );
}
