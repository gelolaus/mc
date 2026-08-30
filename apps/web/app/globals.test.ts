import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('world cutaway styling', () => {
  it('extends the terrain beyond the content column without a page grid', () => {
    const styles = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8');
    expect(styles).toContain('width: 100vw');
    expect(styles).toContain("url('/images/jpcs-world-cutaway.png')");
    expect(styles).not.toContain('background-size: auto, 24px 24px, 24px 24px');
    expect(styles).toContain('overflow-x: hidden');
    expect(styles).toContain('border-top: 0');
  });
});
