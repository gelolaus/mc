import { describe, expect, it, vi } from 'vitest';
import type { Player, Server } from './api';
import { refreshHomeData, refreshPlayer, refreshPlayers } from './live-data';

const server = { serverKey: 'lobby', displayName: 'Lobby' } as Server;
const player = { minecraftUuid: 'player-1', username: 'Gelo', online: true } as Player;

const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

describe('live player data', () => {
  it('refreshes all homepage endpoints', async () => {
    const fetcher = vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith('/servers')) return response([server]);
      if (url.endsWith('/players/new')) return response([player]);
      return response([player]);
    });

    const data = await refreshHomeData({ servers: [], newest: [], players: [] }, fetcher as typeof fetch, 'https://api.example');

    expect(data).toEqual({ servers: [server], newest: [player], players: [player] });
    expect(fetcher.mock.calls.map(([url]) => String(url))).toEqual([
      'https://api.example/v1/servers',
      'https://api.example/v1/players/new',
      'https://api.example/v1/players',
    ]);
  });

  it('retains the last successful values when refresh requests fail', async () => {
    const current = { servers: [server], newest: [player], players: [player] };
    const fetcher = vi.fn(async () => response(null, false));

    await expect(refreshHomeData(current, fetcher as typeof fetch, 'https://api.example')).resolves.toEqual(current);
    await expect(refreshPlayers([player], 'Gelo', fetcher as typeof fetch, 'https://api.example')).resolves.toEqual([player]);
    await expect(refreshPlayer(player, 'Gelo', fetcher as typeof fetch, 'https://api.example')).resolves.toEqual(player);
  });
});
