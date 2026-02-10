import type { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  title: string;
};

export function PageHeader({ title, children }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {children}
    </div>
  );
}
