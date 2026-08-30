import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('homepage', () => {
  it('includes server list and player sections', () => {
    const page = readFileSync(fileURLToPath(new URL('./page.tsx', import.meta.url)), 'utf8');
    expect(page).toContain('JPCS-APC');
    expect(page).toContain('ServerList');
    expect(page).toContain('PlayerStrip');
    expect(page).toContain('hero-world');
    expect(page).toContain('hero-scene');
    expect(page).toContain('world-layer cave-layer');
    expect(page).toContain('world-layer deepslate-layer');
    expect(page).toContain('world-layer bedrock-layer');
    expect(page).toContain('No players online right now.');
    expect(page).toContain('world-cutaway');
  });
});
