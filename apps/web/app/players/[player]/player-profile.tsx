'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { GuiPanel, ItemFrame } from '../../../components';
import { avatar, type Player } from '../../../lib/api';
import { date, duration } from '../../../lib/format';
import { refreshPlayer } from '../../../lib/live-data';

export function PlayerProfile({ id, initial }: { id: string; initial: Player }) {
  const [player, setPlayer] = useState(initial);
  const latest = useRef(player);

  useEffect(() => {
    let active = true;
    const update = async () => {
      const next = await refreshPlayer(latest.current, id);
      if (active) {
        latest.current = next;
        setPlayer(next);
      }
    };
    void update();
    const timer = setInterval(update, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

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
