import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('gui components', () => {
  it('exports primitive wrappers with expected class names', () => {
    const panel = readFileSync(fileURLToPath(new URL('./gui-panel.tsx', import.meta.url)), 'utf8');
    const button = readFileSync(fileURLToPath(new URL('./gui-button.tsx', import.meta.url)), 'utf8');
    const frame = readFileSync(fileURLToPath(new URL('./item-frame.tsx', import.meta.url)), 'utf8');
    const badge = readFileSync(fileURLToPath(new URL('./stat-badge.tsx', import.meta.url)), 'utf8');
    expect(panel).toContain('gui-panel');
    expect(button).toContain('gui-button');
    expect(frame).toContain('item-frame');
    expect(badge).toContain('stat-badge');
  });
});
