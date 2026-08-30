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

  it('defines minecraft gui tokens and classes', () => {
    const css = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8');
    expect(css).toContain('--panel:');
    expect(css).toContain('--border:');
    expect(css).toContain('--grass:');
    expect(css).toContain('.gui-panel');
    expect(css).toContain('.server-row');
    expect(css).toContain('image-rendering: pixelated');
  });

  it('loads a pixel display font in layout', () => {
    const layout = readFileSync(fileURLToPath(new URL('./layout.tsx', import.meta.url)), 'utf8');
    expect(layout).toContain('--font-mc-pixel');
  });
});
