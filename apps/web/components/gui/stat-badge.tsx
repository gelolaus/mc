import type { ReactNode } from 'react';

export function StatBadge({ label, value }: { label: string; value: ReactNode }) {
  return <div className="stat-badge"><span className="meta pixel">{label}</span><b>{value}</b></div>;
}
