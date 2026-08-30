'use client';

import { useState } from 'react';
import { GuiButton } from './gui-button';

export function CopyIp({ host }: { host: string }) {
  const [label, setLabel] = useState('Copy');
  return (
    <GuiButton
      onClick={async () => {
        await navigator.clipboard.writeText(host);
        setLabel('Copied');
        setTimeout(() => setLabel('Copy'), 1600);
      }}
    >
      {label}
    </GuiButton>
  );
}
