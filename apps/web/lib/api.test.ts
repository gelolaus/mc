import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { avatar } from './api';

describe('player avatars', () => {
  it('looks up Minecraft heads by username, not offline UUID', () => {
    const card = readFileSync(fileURLToPath(new URL('../components.tsx', import.meta.url)), 'utf8');
    const profile = readFileSync(fileURLToPath(new URL('../app/players/[player]/page.tsx', import.meta.url)), 'utf8');
    expect(avatar('Gelo')).toBe('https://mc-heads.net/avatar/Gelo/96');
    expect(card).toContain('avatar(player.username)');
    expect(profile).toContain('avatar(player.username)');
  });

  it('allows mc-heads.net through the Next image optimizer', () => {
    const config = readFileSync(fileURLToPath(new URL('../next.config.ts', import.meta.url)), 'utf8');
    expect(config).toContain('mc-heads.net');
    expect(config).toContain('remotePatterns');
  });
});
