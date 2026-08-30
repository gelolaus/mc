import type { ReactNode } from 'react';

export function GuiPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`gui-panel ${className}`.trim()}>{children}</div>;
}
