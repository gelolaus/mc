import { MapFrame, StatBadge } from '../../components';
import { api, type Server } from '../../lib/api';
import { date, duration } from '../../lib/format';

export default async function World() {
  const world = await api<Server & { displayName: string; totalPlayers: number; totalPlaytimeSeconds: number }>('/world');

  return (
    <section className="section">
      <h1 className="pixel" style={{ fontSize: 'clamp(42px, 6vw, 64px)' }}>Our World</h1>
      {world ? (
        <>
          <div className="stats-row">
            <StatBadge label="ESTABLISHED" value={date(world.worldCreatedAt)} />
            <StatBadge label="WORLD AGE" value={duration(world.worldAgeSeconds, true)} />
            <StatBadge label="PEOPLE" value={world.totalPlayers} />
            <StatBadge label="PLAYTIME" value={duration(world.totalPlaytimeSeconds, true)} />
            <StatBadge label="SERVER" value={world.online ? 'ONLINE' : 'OFFLINE'} />
            <StatBadge label="VERSION" value={world.version ?? 'Status unavailable'} />
          </div>
          <div className="section">
            <h2 className="pixel">World map</h2>
            <MapFrame />
          </div>
        </>
      ) : (
        <div className="empty">World statistics are unavailable.</div>
      )}
    </section>
  );
}
