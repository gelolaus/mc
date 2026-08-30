'use client';

import { useState } from 'react';
import { GuiButton } from './gui-button';

export function CopyIp({ host }: { host: string }) {
  const [label, setLabel] = useState('COPY IP');
  return (
    <GuiButton
      onClick={async () => {
        await navigator.clipboard.writeText(host);
        setLabel('COPIED');
        setTimeout(() => setLabel('COPY IP'), 1600);
      }}
    >
      {label}
    </GuiButton>
  );
}
