import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';

const keys = ['survival', 'creative'] as const;
const timeout = () => Math.max(1, Number(process.env.MINECRAFT_HEARTBEAT_TIMEOUT_SECONDS ?? 120)) * 1000;
const now = () => new Date();

@Injectable()
export class ServerService {
  constructor(private readonly db: DatabaseService) {}

  private state(state: any, worldCreatedAt: Date, serverKey: string) {
    const online = Boolean(state?.lastHeartbeatAt && !state.stoppedAt && now().getTime() - state.lastHeartbeatAt.getTime() <= timeout());
    return { serverKey, displayName: state?.displayName ?? (serverKey === 'survival' ? 'Survival' : 'Creative'), host: process.env.MINECRAFT_SERVER_HOST ?? 'mc.jpcs-apc.org', online, playersOnline: online ? state?.playersOnline ?? 0 : null, playersMax: online ? state?.playersMax ?? null : null, version: state?.version ?? null, serverStartedAt: state?.serverStartedAt?.toISOString() ?? null, lastHeartbeatAt: state?.lastHeartbeatAt?.toISOString() ?? null, uptimeSeconds: online && state?.serverStartedAt ? Math.max(0, Math.floor((now().getTime() - state.serverStartedAt.getTime()) / 1000)) : null, worldCreatedAt: worldCreatedAt.toISOString(), worldAgeSeconds: Math.max(0, Math.floor((now().getTime() - worldCreatedAt.getTime()) / 1000)) };
  }

  async publicStates() {
    const [states, world] = await Promise.all([this.db.serverState.findMany({ where: { serverKey: { in: [...keys] } } }), this.db.world.findUnique({ where: { id: 1 } })]);
    const worldCreatedAt = world?.createdAt ?? new Date(process.env.WORLD_CREATED_AT ?? '2026-07-23T00:00:00.000Z');
    return keys.map((key) => this.state(states.find((state: any) => state.serverKey === key), worldCreatedAt, key));
  }

  async publicState() {
    const states = await this.publicStates();
    const onlineStates = states.filter((state) => state.online);
    const worldCreatedAt = states[0].worldCreatedAt;
    return { host: process.env.MINECRAFT_SERVER_HOST ?? 'mc.jpcs-apc.org', online: onlineStates.length > 0, playersOnline: onlineStates.length ? onlineStates.reduce((total, state) => total + (state.playersOnline ?? 0), 0) : null, playersMax: onlineStates.length ? onlineStates.reduce((total, state) => total + (state.playersMax ?? 0), 0) : null, version: onlineStates.map((state) => state.version).filter(Boolean).join(', ') || null, serverStartedAt: null, lastHeartbeatAt: onlineStates.map((state) => state.lastHeartbeatAt).filter(Boolean).sort().at(-1) ?? null, uptimeSeconds: null, worldCreatedAt, worldAgeSeconds: states[0].worldAgeSeconds };
  }

  async world() {
    const [server, servers, world, totalPlayers, total] = await Promise.all([this.publicState(), this.publicStates(), this.db.world.findUnique({ where: { id: 1 } }), this.db.player.count(), this.db.player.aggregate({ _sum: { playtimeSeconds: true } })]);
    return { ...server, servers, displayName: world?.displayName ?? 'Our World', totalPlayers, totalPlaytimeSeconds: total._sum.playtimeSeconds ?? 0 };
  }
}
