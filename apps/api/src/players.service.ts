import { Injectable, NotFoundException } from '@nestjs/common'; import { DatabaseService } from './database.service'; import { PlayerQueryDto } from './dto';
@Injectable()
export class PlayersService { constructor(private readonly db: DatabaseService) {}
  async list(query: PlayerQueryDto) { const orderBy = query.sort === 'alphabetical' ? { username: 'asc' as const } : query.sort === 'playtime' ? { playtimeSeconds: 'desc' as const } : query.sort === 'recentlySeen' ? { lastSeenAt: 'desc' as const } : { firstJoinedAt: query.sort === 'firstJoined' ? 'asc' as const : 'desc' as const }; return this.db.player.findMany({ where: { ...(query.search ? { username: { contains: query.search, mode: 'insensitive' } } : {}), ...(query.online === 'true' ? { online: true } : {}) }, orderBy: [{ online: 'desc' }, orderBy], take: 200 }); }
  async newest() { return this.db.player.findMany({ orderBy: { firstJoinedAt: 'desc' }, take: 8 }); }
  async profile(id: string) { const player = await this.db.player.findFirst({ where: { OR: [{ minecraftUuid: id }, { username: { equals: id, mode: 'insensitive' } }] } }); if (!player) throw new NotFoundException('Player not found'); return player; }
}

