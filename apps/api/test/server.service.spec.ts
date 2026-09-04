import { describe, expect, it } from 'vitest';
import { ServerService } from '../src/server.service';

const world = { findUnique: async () => ({ createdAt: new Date('2026-07-23T00:00:00.000Z') }) };

describe('ServerService', () => {
  it('marks an expired heartbeat offline and hides aggregate counts', async () => {
    process.env.MINECRAFT_HEARTBEAT_TIMEOUT_SECONDS = '120';
    const stale = new Date(Date.now() - 121_000);
    const db = { serverState: { findMany: async () => [{ serverKey: 'survival', displayName: 'Survival', lastHeartbeatAt: stale, serverStartedAt: new Date(Date.now() - 3_600_000), stoppedAt: null, playersOnline: 8, playersMax: 50, version: '26.2' }] }, world } as any;

    await expect(new ServerService(db).publicState()).resolves.toMatchObject({ online: false, uptimeSeconds: null, playersOnline: null });
  });

  it('derives uptime from each server start timestamp', async () => {
    process.env.MINECRAFT_HEARTBEAT_TIMEOUT_SECONDS = '120';
    const started = new Date(Date.now() - 65_000);
    const db = { serverState: { findMany: async () => [{ serverKey: 'survival', displayName: 'Survival', lastHeartbeatAt: new Date(), serverStartedAt: started, stoppedAt: null, playersOnline: 1, playersMax: 50, version: '26.2' }] }, world } as any;

    const survival = (await new ServerService(db).publicStates()).find((server) => server.serverKey === 'survival')!;
    expect(survival.uptimeSeconds).toBeGreaterThanOrEqual(64);
  });

  it('sums backend players without multiplying the shared network capacity', async () => {
    process.env.MINECRAFT_HEARTBEAT_TIMEOUT_SECONDS = '120';
    const current = new Date();
    const db = {
      serverState: {
        findMany: async () => [
          { serverKey: 'lobby', lastHeartbeatAt: current, stoppedAt: null, playersOnline: 1, playersMax: 60 },
          { serverKey: 'survival', lastHeartbeatAt: current, stoppedAt: null, playersOnline: 2, playersMax: 60 },
          { serverKey: 'creative', lastHeartbeatAt: current, stoppedAt: null, playersOnline: 3, playersMax: 60 },
        ],
      },
      world,
    } as any;

    await expect(new ServerService(db).publicState()).resolves.toMatchObject({ playersOnline: 6, playersMax: 60 });
  });
});
