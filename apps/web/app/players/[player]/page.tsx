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
    <section className="profile interior-page">
      <GuiPanel className="profile-identity">
        <ItemFrame>
          <Image className="avatar" src={avatar(player)} width={128} height={128} alt={`${player.username}'s Minecraft head`} />
        </ItemFrame>
        <div className="profile-copy">
          <span className="eyebrow">Player profile</span>
          <h1 className="pixel profile-title">{player.username}</h1>
          <span className={`profile-presence ${player.online ? 'online' : 'offline'}`}>
            <span aria-hidden="true" />
            {player.online ? 'Online now' : 'Offline'}
          </span>
        </div>
      </GuiPanel>
      <div className="profile-stats" aria-label={`${player.username}'s player statistics`}>
        <article className="profile-stat"><span className="meta">First joined</span><b>{date(player.firstJoinedAt)}</b></article>
        <article className="profile-stat"><span className="meta">Last seen</span><b>{player.online ? 'Online now' : date(player.lastSeenAt)}</b></article>
        <article className="profile-stat"><span className="meta">Playtime</span><b>{duration(player.playtimeSeconds, true)}</b></article>
        <article className="profile-stat"><span className="meta">Sessions</span><b>{player.sessionCount}</b></article>
      </div>
    </section>
  );
}
