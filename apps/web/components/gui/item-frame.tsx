import type { ReactNode } from 'react';

export function ItemFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`item-frame ${className}`.trim()}>{children}</div>;
}
