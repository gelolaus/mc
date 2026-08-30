import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('player profile', () => {
  it('renders compact semantic statistics without nested empty panels', () => {
    const page = readFileSync(fileURLToPath(new URL('./[player]/page.tsx', import.meta.url)), 'utf8');

    expect(page).toContain('profile-identity');
    expect(page).toContain('profile-stats');
    expect(page).toContain('profile-stat');
    expect(page).not.toContain('book-page');
    expect(page).not.toContain("style={{ fontSize:");
  });
});
