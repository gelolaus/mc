import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('player components', () => {
  it('links slots to profile pages and uses avatar(player)', () => {
    const slot = readFileSync(fileURLToPath(new URL('./player-slot.tsx', import.meta.url)), 'utf8');
    expect(slot).toContain('player-slot');
    expect(slot).toContain('avatar(player)');
    expect(slot).toContain('/players/');
  });
});
