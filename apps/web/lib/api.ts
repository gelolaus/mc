export type Server = { serverKey:string;displayName:string;host:string;online:boolean;playersOnline:number|null;playersMax:number|null;version:string|null;serverStartedAt:string|null;lastHeartbeatAt:string|null;uptimeSeconds:number|null;worldCreatedAt:string;worldAgeSeconds:number };
export type Player = { minecraftUuid:string;username:string;firstJoinedAt:string;lastSeenAt:string;playtimeSeconds:number;sessionCount:number;online:boolean;skinTextureHash?:string|null };
const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export async function api<T>(path:string):Promise<T|null>{ try { const res=await fetch(`${base}/v1${path}`,{cache:'no-store'}); return res.ok ? res.json() : null; } catch { return null; } }
export const avatar = (player: Pick<Player, 'username' | 'skinTextureHash'>) => `https://mc-heads.net/avatar/${encodeURIComponent(player.skinTextureHash ?? player.username)}/96`;
