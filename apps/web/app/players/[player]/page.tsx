import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GuiPanel, ItemFrame } from '../../../components';
import { api, avatar, type Player } from '../../../lib/api';
import { date, duration } from '../../../lib/format';

export async function generateMetadata({ params }: { params: Promise<{ player: string }> }): Promise<Metadata> {
  const { player } = await params;
  return { title: `${player} — JPCS-APC Minecraft` };
}

export default async function PlayerPage({ params }: { params: Promise<{ player: string }> }) {
  const { player: id } = await params;
  const player = await api<Player>(`/players/${encodeURIComponent(id)}`);
  if (!player) notFound();

  return (
    <section className="profile">
      <div className="profile-head">
        <ItemFrame>
          <Image className="avatar" src={avatar(player)} width={104} height={104} alt={`${player.username}'s Minecraft head`} />
        </ItemFrame>
        <div>
          <h1 className="pixel" style={{ fontSize: 'clamp(42px, 6vw, 64px)', margin: 0 }}>{player.username}</h1>
          <span className={`pixel ${player.online ? 'online' : 'offline'}`}>● {player.online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
      <GuiPanel className="book-page">
        <div className="facts">
          <div><div className="meta">FIRST JOINED</div><b>{date(player.firstJoinedAt)}</b></div>
          <div><div className="meta">LAST SEEN</div><b>{player.online ? 'Online' : date(player.lastSeenAt)}</b></div>
          <div><div className="meta">PLAYTIME</div><b>{duration(player.playtimeSeconds, true)}</b></div>
          <div><div className="meta">SESSIONS</div><b>{player.sessionCount}</b></div>
        </div>
      </GuiPanel>
    </section>
  );
}
