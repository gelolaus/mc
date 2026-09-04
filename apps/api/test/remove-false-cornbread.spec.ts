import { describe, expect, it } from 'vitest';
import { removeFalseCornbread } from '../src/remove-false-cornbread';

const falseRecord = {
  minecraftUuid: '0ed62306-1335-36f4-89a8-e289a75e6e54',
  username: 'Cornbread2100_',
  firstJoinedAt: new Date('2026-08-31T02:27:00.973Z'),
  lastJoinedAt: new Date('2026-08-31T02:27:00.973Z'),
  lastSeenAt: new Date('2026-08-31T02:27:00.973Z'),
  playtimeSeconds: 0,
  sessionCount: 1,
  online: false,
  skinTextureHash: null as string | null,
  currentServerKey: null,
  createdAt: new Date('2026-08-31T02:27:00.996Z'),
  updatedAt: new Date('2026-08-31T06:15:29.211Z'),
};

function database(record = { ...falseRecord }) {
  let player: typeof falseRecord | null = record;
  return {
    get playerRecord() { return player; },
    player: {
      deleteMany: async ({ where }: any) => {
        const matches = player && Object.entries(where).every(([key, value]) => {
          const actual = player?.[key as keyof typeof player];
          return actual instanceof Date && value instanceof Date
            ? actual.getTime() === value.getTime()
            : actual === value;
        });
        if (matches) player = null;
        return { count: matches ? 1 : 0 };
      },
    },
  };
}

describe('removeFalseCornbread', () => {
  it('removes only the unchanged failed-connection record', async () => {
    const unchanged = database();
    const genuineActivity = database({ ...falseRecord, skinTextureHash: 'newly-reported-skin' });

    await expect(removeFalseCornbread(unchanged as any)).resolves.toBe('removed');
    expect(unchanged.playerRecord).toBeNull();

    await expect(removeFalseCornbread(genuineActivity as any)).resolves.toBe('preserved');
    expect(genuineActivity.playerRecord).not.toBeNull();
  });
});
