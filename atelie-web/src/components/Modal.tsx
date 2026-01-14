type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ isOpen, onClose, children }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-full max-w-md">
        {children}

        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-500"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
