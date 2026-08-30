import { describe, expect, it } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { HeartbeatDto, JoinDto, PlayerServerDto, QuitDto } from '../src/dto';

const offlineUuid = 'c2255bd2-ccb1-3a3f-a918-2cb5cb483b14';

describe('ingest DTOs', () => {
  it('accepts UUID v3 player ids from Velocity offline-mode and Floodgate', async () => {
    const heartbeat = plainToInstance(HeartbeatDto, {
      serverKey: 'survival',
      serverStartedAt: '2026-08-30T13:30:49.536Z',
      version: 'Paper 26.2',
      playersOnline: 1,
      playersMax: 120,
      onlinePlayerUuids: [offlineUuid],
    });
    const join = plainToInstance(JoinDto, {
      uuid: offlineUuid,
      username: 'xu_meekah',
      joinedAt: '2026-08-30T13:32:24.000Z',
    });
    const quit = plainToInstance(QuitDto, {
      uuid: offlineUuid,
      username: 'xu_meekah',
      leftAt: '2026-08-30T14:00:00.000Z',
      sessionPlaytimeSeconds: 120,
    });
    const connected = plainToInstance(PlayerServerDto, {
      uuid: offlineUuid,
      serverKey: 'survival',
      connectedAt: '2026-08-30T13:32:24.000Z',
    });

    expect(await validate(heartbeat)).toEqual([]);
    expect(await validate(join)).toEqual([]);
    expect(await validate(quit)).toEqual([]);
    expect(await validate(connected)).toEqual([]);
  });
});
