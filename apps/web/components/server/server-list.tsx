'use client';

import { useEffect, useState } from 'react';
import type { Server } from '../../lib/api';
import { GuiPanel } from '../gui/gui-panel';
import { ServerRow } from './server-row';

export function ServerList({ initial }: { initial: Server[] | null }) {
  const [servers, setServers] = useState(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/v1/servers`);
      if (response.ok) setServers(await response.json());
    }, 30000);
    return () => clearInterval(id);
  }, []);

  if (!servers) {
    return (
      <GuiPanel>
        <div className="server-row">
          <span className="offline">●</span>
          <div><b className="pixel">Status unavailable</b><div className="meta">API unreachable</div></div>
        </div>
      </GuiPanel>
    );
  }

  return (
    <GuiPanel>
      {servers.map((server) => <ServerRow key={server.serverKey} server={server} />)}
    </GuiPanel>
  );
}
