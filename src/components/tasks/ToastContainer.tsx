import type { Toast } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastStyles: Record<Toast['type'], string> = {
  success: 'bg-green-800 text-white',
  error:   'bg-red-700   text-white',
  info:    'bg-gray-900  text-white',
};

const toastIcons: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm max-w-sm ${toastStyles[toast.type]}`}
        >
          <span className="flex-shrink-0 font-bold">{toastIcons[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss notification"
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
