import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { avatar } from './api';

const hash = 'cb50beab76e56472637c304a54b330780e278decb017707bf7604e484e4d6c9f';

describe('player avatars', () => {
  it('prefers a stored skin texture hash over username lookup', () => {
    expect(avatar({ username: 'Gelo', skinTextureHash: hash })).toBe(`https://mc-heads.net/avatar/${hash}/96`);
    expect(avatar({ username: 'Gelo', skinTextureHash: null })).toBe('https://mc-heads.net/avatar/Gelo/96');
  });

  it('uses stored skin texture hashes in player cards and profiles', () => {
    const slot = readFileSync(fileURLToPath(new URL('../components/player/player-slot.tsx', import.meta.url)), 'utf8');
    const profile = readFileSync(fileURLToPath(new URL('../app/players/[player]/player-profile.tsx', import.meta.url)), 'utf8');
    expect(slot).toContain('avatar(player)');
    expect(profile).toContain('avatar(player)');
  });

  it('allows mc-heads.net through the Next image optimizer', () => {
    const config = readFileSync(fileURLToPath(new URL('../next.config.ts', import.meta.url)), 'utf8');
    expect(config).toContain('mc-heads.net');
    expect(config).toContain('remotePatterns');
  });
});
