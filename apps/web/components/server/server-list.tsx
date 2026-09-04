import type { Server } from '../../lib/api';
import { GuiPanel } from '../gui/gui-panel';
import { ServerRow } from './server-row';

export function ServerList({ servers }: { servers: Server[] | null }) {
  if (!servers) {
    return (
      <GuiPanel className="server-list">
        <div className="server-row">
          <span className="offline">●</span>
          <b className="pixel">Offline</b>
        </div>
      </GuiPanel>
    );
  }

  return (
    <GuiPanel className="server-list">
      {servers.map((server) => <ServerRow key={server.serverKey} server={server} />)}
    </GuiPanel>
  );
}
