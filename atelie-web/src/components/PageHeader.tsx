import type { ReactNode } from 'react';

type Props = { children?: ReactNode; title: string; subtitle?: string; };

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
