import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function GuiButton({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return <button className={`gui-button ${className}`.trim()} type="button" {...props}>{children}</button>;
}
