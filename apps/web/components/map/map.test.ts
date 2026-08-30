import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('map frame', () => {
  it('shows map coming soon without env url', () => {
    const map = readFileSync(fileURLToPath(new URL('./map-frame.tsx', import.meta.url)), 'utf8');
    expect(map).toContain('Map coming soon');
    expect(map).toContain('NEXT_PUBLIC_WORLD_MAP_URL');
  });
});
