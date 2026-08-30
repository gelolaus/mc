import type { Server } from '../../lib/api';
import { duration } from '../../lib/format';

export function ServerRow({ server }: { server: Server }) {
  return (
    <div className={`server-row server-${server.serverKey}`}>
      <div className={`server-beacon ${server.online ? 'is-online' : 'is-offline'}`} aria-hidden="true">
        <span />
      </div>
      <div className="server-main">
        <b className="pixel">{server.displayName}</b>
        <div className={server.online ? 'online server-state' : 'offline server-state'}>{server.online ? 'ONLINE' : 'OFFLINE'}</div>
      </div>
      <div className="server-details meta">
        <span>{server.online ? `${server.playersOnline ?? 0}/${server.playersMax ?? '—'}` : '—'}</span>
        <span>{server.online ? duration(server.uptimeSeconds) : server.version ?? '—'}</span>
      </div>
    </div>
  );
}
