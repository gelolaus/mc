import { api, type Player, type Server } from '../lib/api';
import { HomeLive } from './home-live';

export default async function Home() {
  const [servers, newest, players] = await Promise.all([
    api<Server[]>('/servers'),
    api<Player[]>('/players/new'),
    api<Player[]>('/players'),
  ]);
  return <HomeLive initialServers={servers} initialNewest={newest} initialPlayers={players} />;
}
