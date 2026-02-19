import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(message.id), 4000);
    return () => clearTimeout(timer);
  }, [message.id, onClose]);

  const isError = message.type === 'error';
  const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200';
  const textColor = isError ? 'text-red-800' : 'text-emerald-800';
  const iconColor = isError ? 'text-red-500' : 'text-emerald-500';

  return (
    <div className={`fixed bottom-4 right-4 flex items-start gap-3 p-4 rounded-xl border ${bgColor} shadow-lg max-w-xs z-50 animate-in slide-in-from-bottom-4`}>
      {isError ? (
        <AlertCircle size={20} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
      ) : (
        <CheckCircle size={20} className={`flex-shrink-0 mt-0.5 ${iconColor}`} />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{message.message}</p>
      </div>
      <button onClick={() => onClose(message.id)} className="flex-shrink-0">
        <X size={16} className={textColor} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export function ToastContainer({ messages, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {messages.map(msg => (
        <Toast key={msg.id} message={msg} onClose={onClose} />
      ))}
    </div>
  );
}
