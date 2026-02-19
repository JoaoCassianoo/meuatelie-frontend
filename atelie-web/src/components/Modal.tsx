import { useEffect } from 'react';
import type { ReactNode } from 'react';

type Props = { isOpen: boolean; onClose: () => void; children: ReactNode; };

export function Modal({ isOpen, onClose, children }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-2xl"/>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
