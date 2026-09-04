import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api, type Player } from '../../../lib/api';
import { PlayerProfile } from './player-profile';

export async function generateMetadata({ params }: { params: Promise<{ player: string }> }): Promise<Metadata> {
  const { player } = await params;
  return { title: `${player} — JPCS-APC Minecraft` };
}

export default async function PlayerPage({ params }: { params: Promise<{ player: string }> }) {
  const { player: id } = await params;
  const player = await api<Player>(`/players/${encodeURIComponent(id)}`);
  if (!player) notFound();

  return <PlayerProfile id={id} initial={player} />;
}
