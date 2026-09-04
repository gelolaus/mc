import { describe, expect, it } from 'vitest';
import { ServerService } from '../src/server.service';

describe('ServerService publicStates', () => {
  it('returns Lobby, Survival, and Creative independently', async () => {
    process.env.MINECRAFT_HEARTBEAT_TIMEOUT_SECONDS = '120';
    const db = {
      serverState: {
        findMany: async () => [
          { serverKey: 'lobby', displayName: 'Lobby', lastHeartbeatAt: new Date(), serverStartedAt: new Date(Date.now() - 90_000), stoppedAt: null, playersOnline: 1, playersMax: 50, version: '26.2' },
          { serverKey: 'survival', displayName: 'Survival', lastHeartbeatAt: new Date(), serverStartedAt: new Date(Date.now() - 60_000), stoppedAt: null, playersOnline: 4, playersMax: 50, version: '26.2' },
          { serverKey: 'creative', displayName: 'Creative', lastHeartbeatAt: new Date(), serverStartedAt: new Date(Date.now() - 30_000), stoppedAt: null, playersOnline: 2, playersMax: 30, version: '26.2' },
        ],
      },
      world: { findUnique: async () => ({ createdAt: new Date('2026-07-23T00:00:00.000Z') }) },
    } as any;

    const states = await new ServerService(db).publicStates();

    expect(states.map((state) => state.serverKey)).toEqual(['lobby', 'survival', 'creative']);
    expect(states.map((state) => state.playersOnline)).toEqual([1, 4, 2]);
  });
});
