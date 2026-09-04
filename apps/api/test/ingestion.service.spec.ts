import { describe, expect, it } from 'vitest';
import { IngestionService } from '../src/ingestion.service';

function database() {
  const players = new Map<string, any>();
  const updatePlayer = (player: any, data: any) => {
    const plain = { ...data };
    for (const key of ['sessionCount', 'playtimeSeconds']) {
      if (plain[key]?.increment) {
        player[key] = (player[key] ?? 0) + plain[key].increment;
        delete plain[key];
      }
    }
    Object.assign(player, plain);
  };
  const matches = (player: any, where: any) => {
    if (where.minecraftUuid && player.minecraftUuid !== where.minecraftUuid) return false;
    if (where.lastJoinedAt?.lt && !(player.lastJoinedAt < where.lastJoinedAt.lt)) return false;
    if (where.lastSeenAt?.lte && !(player.lastSeenAt <= where.lastSeenAt.lte)) return false;
    return true;
  };
  return {
    players,
    player: {
      upsert: async ({ where, create, update }: any) => {
        const found = players.get(where.minecraftUuid);
        if (found) {
          updatePlayer(found, update);
          return found;
        }
        players.set(where.minecraftUuid, create);
        return create;
      },
      update: async ({ where, data }: any) => {
        const item = players.get(where.minecraftUuid);
        if (!item) throw new Error('missing');
        updatePlayer(item, data);
        return item;
      },
      updateMany: async ({ where, data }: any) => {
        let count = 0;
        for (const player of players.values()) {
          if (matches(player, where)) {
            updatePlayer(player, data);
            count++;
          }
        }
        return { count };
      },
    },
    serverState: { upsert: async () => ({}) },
    $transaction: async (items: any[]) => Promise.all(items),
  } as any;
}

const uuid = '550e8400-e29b-41d4-a716-446655440000';

describe('IngestionService', () => {
  it('preserves firstJoinedAt for a returning player', async () => {
    const db = database();
    const service = new IngestionService(db);
    await service.join({ uuid, username: 'first', joinedAt: '2026-07-23T00:00:00.000Z' });
    await service.join({ uuid, username: 'renamed', joinedAt: '2026-08-23T00:00:00.000Z' });
    expect(db.players.get(uuid)).toMatchObject({
      firstJoinedAt: new Date('2026-07-23T00:00:00.000Z'),
      username: 'renamed',
      sessionCount: 2,
    });
  });

  it('does not double-count or move a player backward when join delivery is delayed', async () => {
    const db = database();
    const service = new IngestionService(db);
    await service.heartbeat({
      serverKey: 'lobby',
      serverStartedAt: '2026-09-04T00:00:00.000Z',
      version: 'Paper 26.2',
      playersOnline: 1,
      playersMax: 60,
      onlinePlayers: [{ uuid, username: 'player' }],
    } as any);
    await service.playerServer({ uuid, username: 'player', serverKey: 'survival', connectedAt: '2026-09-04T00:00:02.000Z' } as any);
    await service.join({ uuid, username: 'player', serverKey: 'lobby', joinedAt: '2026-09-04T00:00:01.000Z' });

    expect(db.players.get(uuid)).toMatchObject({ sessionCount: 1, currentServerKey: 'survival' });
  });

  it('adds only non-negative quit playtime after DTO validation', async () => {
    const db = database();
    const service = new IngestionService(db);
    await service.join({ uuid, username: 'player', joinedAt: '2026-07-23T00:00:00.000Z' });
    await service.quit({ uuid, username: 'player', leftAt: '2026-07-23T01:00:00.000Z', sessionPlaytimeSeconds: 3600 });
    expect(db.players.get(uuid).playtimeSeconds).toBe(3600);
  });
});
