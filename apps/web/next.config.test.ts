import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('Next configuration', () => {
  it('does not request standalone output that requires local symlink creation', () => {
    const config = readFileSync(fileURLToPath(new URL('./next.config.ts', import.meta.url)), 'utf8');
    expect(config).not.toContain("output: 'standalone'");
    expect(config).toContain('outputFileTracingRoot');
  });
});
