import { describe, expect, it } from 'vitest';
import { IngestionService } from '../src/ingestion.service';

const liveUuid = '714d14c7-31c9-323e-b864-176af5d4226d';
const staleProxyUuid = '0ed62306-1335-36f4-89a8-e289a75e6e54';

function database() {
  const players = new Map<string, any>([
    [staleProxyUuid, { minecraftUuid: staleProxyUuid, username: 'Cornbread2100_', online: true, currentServerKey: null }],
  ]);

  const matches = (player: any, where: any): boolean => {
    if (where.OR) return where.OR.some((entry: any) => matches(player, entry));
    if (where.currentServerKey !== undefined && player.currentServerKey !== where.currentServerKey) return false;
    if (where.online !== undefined && player.online !== where.online) return false;
    const excluded = where.minecraftUuid?.notIn;
    return !Array.isArray(excluded) || !excluded.includes(player.minecraftUuid);
  };

  return {
    players,
    player: {
      upsert: async ({ where, create, update }: any) => {
        const existing = players.get(where.minecraftUuid);
        const result = existing ? { ...existing, ...update } : create;
        players.set(where.minecraftUuid, result);
        return result;
      },
      updateMany: async ({ where, data }: any) => {
        for (const player of players.values()) if (matches(player, where)) Object.assign(player, data);
        return { count: 0 };
      },
    },
    serverState: { upsert: async () => ({}) },
    $transaction: async (operations: Promise<unknown>[]) => Promise.all(operations),
  } as any;
}

describe('heartbeat player presence', () => {
  it('uses confirmed backend identities and clears stale proxy-only presences', async () => {
    const db = database();
    const service = new IngestionService(db);

    await service.heartbeat({
      serverKey: 'survival',
      serverStartedAt: '2026-08-31T03:00:00.000Z',
      version: 'Paper 26.2',
      playersOnline: 1,
      playersMax: 60,
      onlinePlayers: [{ uuid: liveUuid, username: 'Gelo' }],
    } as any);

    expect(db.players.get(liveUuid)).toMatchObject({ username: 'Gelo', online: true, currentServerKey: 'survival' });
    expect(db.players.get(staleProxyUuid)).toMatchObject({ online: false, currentServerKey: null });
  });
});
