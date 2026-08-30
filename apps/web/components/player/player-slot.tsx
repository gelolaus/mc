import Image from 'next/image';
import Link from 'next/link';
import { avatar, type Player } from '../../lib/api';
import { ItemFrame } from '../gui/item-frame';

export function PlayerSlot({ player, size = 64 }: { player: Player; size?: number }) {
  return (
    <Link href={`/players/${encodeURIComponent(player.username)}`} className="player-slot">
      <ItemFrame>
        <Image className="avatar" src={avatar(player)} alt={`${player.username}'s Minecraft head`} width={size} height={size} />
      </ItemFrame>
      <span className="username">{player.username}</span>
      <span className={`meta pixel ${player.online ? 'online' : 'offline'}`}>{player.online ? 'ONLINE' : 'OFFLINE'}</span>
    </Link>
  );
}
