import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('site header', () => {
  it('uses the complete JPCS-APC Minecraft name', () => {
    const header = readFileSync(fileURLToPath(new URL('./site-header.tsx', import.meta.url)), 'utf8');
    expect(header).toContain('JPCS-APC MINECRAFT');
  });
});
