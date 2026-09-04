export const falseCornbreadUuid = '0ed62306-1335-36f4-89a8-e289a75e6e54';

type CleanupDatabase = {
  player: {
    deleteMany(args: { where: Record<string, unknown> }): Promise<{ count: number }>;
  };
};

export async function removeFalseCornbread(db: CleanupDatabase): Promise<'removed' | 'preserved'> {
  const result = await db.player.deleteMany({
    where: {
      minecraftUuid: falseCornbreadUuid,
      username: 'Cornbread2100_',
      firstJoinedAt: new Date('2026-08-31T02:27:00.973Z'),
      lastJoinedAt: new Date('2026-08-31T02:27:00.973Z'),
      lastSeenAt: new Date('2026-08-31T02:27:00.973Z'),
      playtimeSeconds: 0,
      sessionCount: 1,
      online: false,
      skinTextureHash: null,
      currentServerKey: null,
      createdAt: new Date('2026-08-31T02:27:00.996Z'),
      updatedAt: new Date('2026-08-31T06:15:29.211Z'),
    },
  });
  return result.count === 1 ? 'removed' : 'preserved';
}
