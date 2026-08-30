import { describe, expect, it } from 'vitest';
import { IngestionService } from '../src/ingestion.service';

const uuid = '714d14c7-31c9-323e-b864-176af5d4226d';
const hash = 'cb50beab76e56472637c304a54b330780e278decb017707bf7604e484e4d6c9f';

function database() {
  const players = new Map<string, any>();
  return {
    players,
    player: {
      upsert: async ({ where, create, update }: any) => {
        const found = players.get(where.minecraftUuid);
        if (found) {
          const result = { ...found, ...update };
          if (update.sessionCount?.increment) result.sessionCount = found.sessionCount + update.sessionCount.increment;
          players.set(where.minecraftUuid, result);
          return result;
        }
        players.set(where.minecraftUuid, create);
        return create;
      },
      update: async ({ where, data }: any) => {
        const item = players.get(where.minecraftUuid);
        if (!item) throw new Error('missing');
        Object.assign(item, data);
        return item;
      },
      updateMany: async () => ({ count: 0 }),
    },
    serverState: { upsert: async () => ({}) },
    $transaction: async (items: any[]) => Promise.all(items),
  } as any;
}

describe('IngestionService player skins', () => {
  it('stores a skin texture hash on join when provided', async () => {
    const db = database();
    const service = new IngestionService(db);
    await service.join({ uuid, username: 'Gelo', joinedAt: '2026-08-30T13:58:05.477Z', skinTextureHash: hash });
    expect(db.players.get(uuid).skinTextureHash).toBe(hash);
  });

  it('updates an existing player skin texture hash', async () => {
    const db = database();
    const service = new IngestionService(db);
    await service.join({ uuid, username: 'Gelo', joinedAt: '2026-08-30T13:58:05.477Z' });
    await service.playerSkin({ uuid, skinTextureHash: hash });
    expect(db.players.get(uuid).skinTextureHash).toBe(hash);
  });
});
