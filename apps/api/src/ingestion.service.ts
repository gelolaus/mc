import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { HeartbeatDto, JoinDto, PlayerServerDto, PlayerSkinDto, QuitDto, StartDto, StopDto } from './dto';
import { serverDisplayNames } from './server-keys';

@Injectable()
export class IngestionService {
  constructor(private readonly db: DatabaseService) {}

  private displayName(serverKey: string) { return serverDisplayNames[serverKey as keyof typeof serverDisplayNames] ?? serverKey; }

  async heartbeat(input: HeartbeatDto) {
    const at = new Date();
    const onlinePlayers = input.onlinePlayers ?? [];
    const onlinePlayerUuids = onlinePlayers.length ? onlinePlayers.map((player) => player.uuid) : input.onlinePlayerUuids ?? [];
    await this.db.$transaction([
      this.db.serverState.upsert({
        where: { serverKey: input.serverKey },
        create: { serverKey: input.serverKey, displayName: this.displayName(input.serverKey), version: input.version, playersOnline: input.playersOnline, playersMax: input.playersMax, serverStartedAt: new Date(input.serverStartedAt), lastHeartbeatAt: at },
        update: { version: input.version, playersOnline: input.playersOnline, playersMax: input.playersMax, serverStartedAt: new Date(input.serverStartedAt), lastHeartbeatAt: at, stoppedAt: null },
      }),
      this.db.player.updateMany({ where: { OR: [{ currentServerKey: input.serverKey }, { online: true, currentServerKey: null }], minecraftUuid: { notIn: onlinePlayerUuids } }, data: { online: false, currentServerKey: null } }),
      ...onlinePlayers.map((player) => this.db.player.upsert({
        where: { minecraftUuid: player.uuid },
        create: { minecraftUuid: player.uuid, username: player.username, firstJoinedAt: at, lastJoinedAt: at, lastSeenAt: at, sessionCount: 1, online: true, currentServerKey: input.serverKey },
        update: { username: player.username, lastSeenAt: at, online: true, currentServerKey: input.serverKey },
      })),
      ...(onlinePlayers.length ? [] : [this.db.player.updateMany({ where: { minecraftUuid: { in: onlinePlayerUuids } }, data: { online: true, currentServerKey: input.serverKey, lastSeenAt: at } })]),
    ]);
    return { ok: true };
  }

  async join(input: JoinDto) {
    const joinedAt = new Date(input.joinedAt);
    const skin = input.skinTextureHash ? { skinTextureHash: input.skinTextureHash } : {};
    await this.db.$transaction([
      this.db.player.updateMany({ where: { minecraftUuid: input.uuid, lastJoinedAt: { lt: joinedAt } }, data: { lastJoinedAt: joinedAt, sessionCount: { increment: 1 } } }),
      this.db.player.updateMany({ where: { minecraftUuid: input.uuid, lastSeenAt: { lte: joinedAt } }, data: { username: input.username, lastSeenAt: joinedAt, online: true, currentServerKey: input.serverKey, ...skin } }),
      this.db.player.upsert({ where: { minecraftUuid: input.uuid }, create: { minecraftUuid: input.uuid, username: input.username, firstJoinedAt: joinedAt, lastJoinedAt: joinedAt, lastSeenAt: joinedAt, sessionCount: 1, online: true, currentServerKey: input.serverKey, ...skin }, update: {} }),
    ]);
    return { ok: true };
  }

  async playerSkin(input: PlayerSkinDto) {
    await this.db.player.update({ where: { minecraftUuid: input.uuid }, data: { skinTextureHash: input.skinTextureHash } });
    return { ok: true };
  }

  async quit(input: QuitDto) {
    const leftAt = new Date(input.leftAt);
    await this.db.player.update({ where: { minecraftUuid: input.uuid }, data: { username: input.username, lastSeenAt: leftAt, online: false, currentServerKey: null, playtimeSeconds: { increment: input.sessionPlaytimeSeconds } } });
    return { ok: true };
  }

  async playerServer(input: PlayerServerDto) {
    const connectedAt = new Date(input.connectedAt);
    await this.db.player.upsert({ where: { minecraftUuid: input.uuid }, create: { minecraftUuid: input.uuid, username: input.username, firstJoinedAt: connectedAt, lastJoinedAt: connectedAt, lastSeenAt: connectedAt, sessionCount: 1, online: true, currentServerKey: input.serverKey }, update: { username: input.username, online: true, currentServerKey: input.serverKey, lastSeenAt: connectedAt } });
    return { ok: true };
  }

  async start(input: StartDto) {
    await this.db.serverState.upsert({ where: { serverKey: input.serverKey }, create: { serverKey: input.serverKey, displayName: this.displayName(input.serverKey), serverStartedAt: new Date(input.serverStartedAt), version: input.version }, update: { serverStartedAt: new Date(input.serverStartedAt), version: input.version, stoppedAt: null } });
    return { ok: true };
  }

  async stop(input: StopDto) {
    await this.db.serverState.upsert({ where: { serverKey: input.serverKey }, create: { serverKey: input.serverKey, displayName: this.displayName(input.serverKey), stoppedAt: new Date() }, update: { stoppedAt: new Date(), playersOnline: 0 } });
    await this.db.player.updateMany({ where: { currentServerKey: input.serverKey }, data: { online: false, currentServerKey: null } });
    return { ok: true };
  }
}
