export const DEFAULT_HEARTBEAT_TIMEOUT_SECONDS = 120;
export const DEFAULT_WORLD_TIMEZONE = 'Asia/Manila';

export type PublicServer = {
  host: string; online: boolean; playersOnline: number | null; playersMax: number | null;
  version: string | null; serverStartedAt: string | null; lastHeartbeatAt: string | null;
  uptimeSeconds: number | null; worldCreatedAt: string; worldAgeSeconds: number;
};

export type PublicPlayer = {
  minecraftUuid: string; username: string; firstJoinedAt: string; lastSeenAt: string;
  playtimeSeconds: number; sessionCount: number; online: boolean; skinTextureHash?: string | null;
};

