import { MapFrame, StatBadge } from '../../components';
import { api, type Server } from '../../lib/api';
import { date, duration } from '../../lib/format';

export default async function World() {
  const world = await api<Server & { displayName: string; totalPlayers: number; totalPlaytimeSeconds: number }>('/world');

  return (
    <section className="section interior-page">
      <header className="page-heading">
        <span className="eyebrow">World record</span>
        <h1 className="pixel">World</h1>
        <p className="sub">The numbers behind our shared world.</p>
      </header>
      {world ? (
        <>
          <div className="stats-row">
            <StatBadge label="ESTABLISHED" value={date(world.worldCreatedAt)} />
            <StatBadge label="WORLD AGE" value={duration(world.worldAgeSeconds, true)} />
            <StatBadge label="PEOPLE" value={world.totalPlayers} />
            <StatBadge label="PLAYTIME" value={duration(world.totalPlaytimeSeconds, true)} />
            <StatBadge label="SERVER" value={world.online ? 'ONLINE' : 'OFFLINE'} />
            <StatBadge label="VERSION" value={world.version ?? '—'} />
          </div>
          <div className="inner-section">
            <h2 className="pixel">Map</h2>
            <MapFrame />
          </div>
        </>
      ) : (
        <div className="empty">World statistics are unavailable.</div>
      )}
    </section>
  );
}
