import type { Server } from '../../lib/api';
import { duration } from '../../lib/format';

export function ServerRow({ server }: { server: Server }) {
  return (
    <div className="server-row">
      <span className={server.online ? 'online' : 'offline'}>●</span>
      <div>
        <b className="pixel">{server.displayName}</b>
        <div className="meta">{server.version ?? '—'} · {server.online ? duration(server.uptimeSeconds) : 'OFFLINE'}</div>
      </div>
      <div className="meta pixel">{server.online ? `${server.playersOnline} / ${server.playersMax}` : '—'}</div>
    </div>
  );
}
