export type Server = { serverKey:string;displayName:string;host:string;online:boolean;playersOnline:number|null;playersMax:number|null;version:string|null;serverStartedAt:string|null;lastHeartbeatAt:string|null;uptimeSeconds:number|null;worldCreatedAt:string;worldAgeSeconds:number };
export type Player = { minecraftUuid:string;username:string;firstJoinedAt:string;lastSeenAt:string;playtimeSeconds:number;sessionCount:number;online:boolean };
const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
export async function api<T>(path:string):Promise<T|null>{ try { const res=await fetch(`${base}/v1${path}`,{next:{revalidate:30}}); return res.ok ? res.json() : null; } catch { return null; } }
export const avatar = (uuid:string) => `https://mc-heads.net/avatar/${encodeURIComponent(uuid)}/96`;
