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

  it('uses a dedicated readable footer credit', () => {
    const layout = readFileSync(fileURLToPath(new URL('./layout.tsx', import.meta.url)), 'utf8');
    const css = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8');

    expect(layout).toContain('footer-credit');
    expect(css).toMatch(/\.footer-credit\s*\{[^}]*font-size:\s*clamp\(/s);
  });

  it('keeps navigation and profiles usable on narrow screens', () => {
    const css = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8');

    expect(css).toContain('@media (max-width: 760px)');
    expect(css).toMatch(/\.nav-button\s*\{[^}]*min-height:\s*44px/s);
    expect(css).toMatch(/\.profile\s*\{[^}]*max-width:\s*none/s);
    expect(css).toMatch(/\.profile-stats\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s);
  });
});
