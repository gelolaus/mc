import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { DISCORD_FIRST_JOINS } from '../data/discord-first-joins';
import { offlineUuid } from '../src/offline-uuid';

const db = new PrismaClient();

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const entry of DISCORD_FIRST_JOINS) {
    const minecraftUuid = offlineUuid(entry.username);
    const firstJoinedAt = new Date(entry.firstJoinedAt);
    const existing = await db.player.findUnique({ where: { minecraftUuid } });

    if (!existing) {
      await db.player.create({
        data: {
          minecraftUuid,
          username: entry.username,
          firstJoinedAt,
          lastJoinedAt: firstJoinedAt,
          lastSeenAt: firstJoinedAt,
          sessionCount: 0,
          playtimeSeconds: 0,
          online: false,
        },
      });
      created++;
      console.log(`+ ${entry.username} (${firstJoinedAt.toISOString()})`);
      continue;
    }

    if (existing.firstJoinedAt <= firstJoinedAt) {
      skipped++;
      console.log(`= ${entry.username} already has firstJoinedAt ${existing.firstJoinedAt.toISOString()}`);
      continue;
    }

    await db.player.update({
      where: { minecraftUuid },
      data: { firstJoinedAt, username: entry.username },
    });
    updated++;
    console.log(`~ ${entry.username} ${existing.firstJoinedAt.toISOString()} -> ${firstJoinedAt.toISOString()}`);
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${skipped} unchanged (${DISCORD_FIRST_JOINS.length} total)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
