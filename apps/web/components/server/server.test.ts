import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('server list', () => {
  it('renders multiplayer-style rows with online state classes', () => {
    const row = readFileSync(fileURLToPath(new URL('./server-row.tsx', import.meta.url)), 'utf8');
    const list = readFileSync(fileURLToPath(new URL('./server-list.tsx', import.meta.url)), 'utf8');
    expect(row).toContain('server-row');
    expect(row).toContain('displayName');
    expect(row).toContain('playersOnline');
    expect(row).toContain('server-beacon');
    expect(list).toContain('server-list');
    expect(list).toContain('/v1/servers');
    expect(list).toContain('30000');
  });
});
