import type { Player, Server } from './api';

export type HomeData = {
  servers: Server[] | null;
  newest: Player[] | null;
  players: Player[] | null;
};

export const publicApiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function refreshValue<T>(url: string, current: T, fetcher: typeof fetch): Promise<T> {
  try {
    const response = await fetcher(url, { cache: 'no-store' });
    return response.ok ? await response.json() as T : current;
  } catch {
    return current;
  }
}

export async function refreshHomeData(current: HomeData, fetcher: typeof fetch = fetch, apiBase = publicApiBase): Promise<HomeData> {
  const [servers, newest, players] = await Promise.all([
    refreshValue(`${apiBase}/v1/servers`, current.servers, fetcher),
    refreshValue(`${apiBase}/v1/players/new`, current.newest, fetcher),
    refreshValue(`${apiBase}/v1/players`, current.players, fetcher),
  ]);
  return { servers, newest, players };
}

export function refreshPlayers(current: Player[], search: string, fetcher: typeof fetch = fetch, apiBase = publicApiBase) {
  return refreshValue<Player[]>(`${apiBase}/v1/players?search=${encodeURIComponent(search)}`, current, fetcher);
}

export function refreshPlayer(current: Player, id: string, fetcher: typeof fetch = fetch, apiBase = publicApiBase) {
  return refreshValue<Player>(`${apiBase}/v1/players/${encodeURIComponent(id)}`, current, fetcher);
}
