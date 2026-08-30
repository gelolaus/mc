import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('homepage', () => {
  it('includes join, whos home, and community sections', () => {
    const page = readFileSync(fileURLToPath(new URL('./page.tsx', import.meta.url)), 'utf8');
    expect(page).toContain("Who&apos;s home");
    expect(page).toContain('ServerList');
    expect(page).toContain('PlayerStrip');
    expect(page).toContain('StatBadge');
  });
});
