import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('site styling', () => {
  it('keeps the layout to one base stylesheet', () => {
    const layout = readFileSync(fileURLToPath(new URL('./layout.tsx', import.meta.url)), 'utf8');
    const decorativeStylesheet = fileURLToPath(new URL('./archive.css', import.meta.url));

    expect(layout).not.toContain("import './archive.css'");
    expect(existsSync(decorativeStylesheet)).toBe(false);
  });
});
